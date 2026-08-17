import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ParsedEvent {
  uid: string;
  summary: string;
  description?: string;
  location?: string;
  startDate: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  allDay: boolean;
  raw: Record<string, string>;
}

// ---------- iCal parsing ----------

function unfoldLines(text: string): string[] {
  const rawLines = text.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  for (const line of rawLines) {
    if ((line.startsWith(" ") || line.startsWith("\t")) && out.length) {
      out[out.length - 1] += line.slice(1);
    } else {
      out.push(line);
    }
  }
  return out;
}

function unescapeText(s: string): string {
  return s
    .replace(/\\n/g, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

function parseDateTime(propLine: string): {
  date: string;
  time?: string;
  allDay: boolean;
} | null {
  const colonIdx = propLine.indexOf(":");
  if (colonIdx === -1) return null;
  const params = propLine.slice(0, colonIdx);
  const value = propLine.slice(colonIdx + 1).trim();
  const isDateOnly = /VALUE=DATE(?!-TIME)/i.test(params);

  if (isDateOnly || /^\d{8}$/.test(value)) {
    const m = value.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (!m) return null;
    return { date: `${m[1]}-${m[2]}-${m[3]}`, allDay: true };
  }

  const m = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);
  if (!m) return null;
  const isUtc = m[7] === "Z";
  if (isUtc) {
    // Convert UTC to America/Chicago
    const utcDate = new Date(
      `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`,
    );
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const parts = Object.fromEntries(
      fmt.formatToParts(utcDate).map((p) => [p.type, p.value]),
    );
    let hour = parts.hour;
    if (hour === "24") hour = "00";
    return {
      date: `${parts.year}-${parts.month}-${parts.day}`,
      time: `${hour}:${parts.minute}:${parts.second}`,
      allDay: false,
    };
  }
  return {
    date: `${m[1]}-${m[2]}-${m[3]}`,
    time: `${m[4]}:${m[5]}:${m[6]}`,
    allDay: false,
  };
}

function parseICal(text: string): ParsedEvent[] {
  const lines = unfoldLines(text);
  const events: ParsedEvent[] = [];
  let current: Record<string, string> | null = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      current = {};
    } else if (line === "END:VEVENT") {
      if (current && current.UID && current.SUMMARY && current._DTSTART) {
        const start = parseDateTime(current._DTSTART);
        if (start) {
          let endDate: string | undefined;
          let endTime: string | undefined;
          if (current._DTEND) {
            const end = parseDateTime(current._DTEND);
            if (end) {
              endDate = end.date;
              endTime = end.time;
            }
          }
          events.push({
            uid: current.UID,
            summary: unescapeText(current.SUMMARY),
            description: current.DESCRIPTION
              ? unescapeText(current.DESCRIPTION)
              : undefined,
            location: current.LOCATION
              ? unescapeText(current.LOCATION)
              : undefined,
            startDate: start.date,
            startTime: start.time,
            endDate,
            endTime,
            allDay: start.allDay,
            raw: current,
          });
        }
      }
      current = null;
    } else if (current) {
      const sepIdx = Math.min(
        ...[line.indexOf(";"), line.indexOf(":")].filter((i) => i !== -1),
      );
      if (sepIdx === -1 || sepIdx === Infinity) continue;
      const propName = line.slice(0, sepIdx).toUpperCase();
      const colonIdx = line.indexOf(":");
      const valueOnly = colonIdx !== -1 ? line.slice(colonIdx + 1) : "";

      if (propName === "DTSTART") current._DTSTART = line;
      else if (propName === "DTEND") current._DTEND = line;
      else if (
        ["UID", "SUMMARY", "DESCRIPTION", "LOCATION", "RRULE"].includes(
          propName,
        )
      ) {
        current[propName] = valueOnly;
      }
    }
  }

  return events;
}

// ---------- Identity, cancellation, facility path ----------

/**
 * THE ONLY PLACE THE FEED'S CANCELLATION CONVENTION LIVES.
 * The Sports Connect feed carries no STATUS property; a cancelled event is
 * published with a "CANCELED-" prefix on the SUMMARY. If the feed ever gains a
 * real STATUS:CANCELLED property, this function is the single edit.
 */
function detectCancellation(summary: string): { title: string; isCancelled: boolean } {
  const m = summary.match(/^\s*CANCELED-\s*(.*)$/i);
  return m
    ? { title: m[1].trim(), isCancelled: true }
    : { title: summary.trim(), isCancelled: false };
}

/** Title normalized for identity: cancellation prefix stripped, lowercased, whitespace collapsed. */
function normalizeTitle(t: string): string {
  return detectCancellation(t).title.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Deterministic identity for an imported event. The feed's ICS UID is stamped
 * with the sync run time and is therefore useless as a key. Tradeoff: moving an
 * event to a new date/time produces a new key — the old row is marked removed
 * and a new row inserted. Must stay byte-identical to the SQL backfill rule.
 */
async function eventKey(
  calendarId: string,
  summary: string,
  startDate: string,
  startTime?: string,
): Promise<string> {
  const raw = `${calendarId}|${normalizeTitle(summary)}|${startDate}|${startTime ?? ""}`;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Pulls the DESCRIPTION facility path, e.g. "Plato > T-Ball - Field 4". */
function parseFacilityPath(description?: string) {
  const line = description
    ?.split("\n")
    .map((l) => l.trim())
    .find((l) => l.includes(">"));
  if (!line) {
    return {
      facility_path: null,
      facility_site: null,
      facility_area: null,
      facility_field: null,
    };
  }
  const [site, rest = ""] = line.split(">").map((s) => s.trim());
  const dashIdx = rest.lastIndexOf("-");
  const area = dashIdx === -1 ? rest.trim() : rest.slice(0, dashIdx).trim();
  const field = dashIdx === -1 ? null : rest.slice(dashIdx + 1).trim() || null;
  return {
    facility_path: line,
    facility_site: site || null,
    facility_area: area || null,
    facility_field: field,
  };
}

/** Fields compared to decide whether a stored row needs updating. */
const COMPARE_FIELDS = [
  "title",
  "is_cancelled",
  "description",
  "location",
  "start_date",
  "start_time",
  "end_date",
  "end_time",
  "all_day",
  "event_category",
  "program_id",
  "division_id",
  "home_team_id",
  "away_team_id",
  "field_number",
  "facility_path",
] as const;

function differs(stored: any, incoming: any): boolean {
  if (!stored) return true;
  if (stored.status !== "active") return true; // resurrecting a removed row
  return COMPARE_FIELDS.some(
    (f) => (stored[f] ?? null) !== ((incoming as any)[f] ?? null),
  );
}

// ---------- Classification ----------

interface DivisionRow {
  id: string;
  name: string;
  program_id: string;
  program_type: string;
}
interface TeamRow {
  id: string;
  name: string;
  division_id: string;
}
interface ProgramRow {
  id: string;
  type: string;
}

interface Classification {
  event_category: "game" | "practice" | "event";
  program_id: string | null;
  division_id: string | null;
  home_team_id: string | null;
  away_team_id: string | null;
  field_number: string | null;
}

const TRAVEL_AGE_RE = /\b(\d{1,2})\s*[uU]\b/; // 10u, 11U
const FIELD_RE = /Field\s+(\d+)/i;

function detectDivision(
  haystack: string,
  divisions: DivisionRow[],
): DivisionRow | null {
  const lower = haystack.toLowerCase();

  // Travel-style age code: "10u", "8U", etc.
  const ageMatch = haystack.match(TRAVEL_AGE_RE);
  if (ageMatch) {
    const age = ageMatch[1];
    const travel = divisions.find(
      (d) =>
        d.program_type === "travel" &&
        d.name.toLowerCase().startsWith(`${age}u`),
    );
    if (travel) return travel;
  }

  // In-house keyword: Mustang/Pinto/Pony/Bronco/T-Ball
  for (const d of divisions) {
    if (d.program_type !== "in_house") continue;
    const dn = d.name.toLowerCase();
    if (dn === "t-ball") {
      if (/\bt[-\s]?ball\b/i.test(haystack)) return d;
    } else if (lower.includes(dn)) {
      return d;
    }
  }

  return null;
}

function stripDivisionPrefix(teamName: string, divisionName: string): string {
  // Remove "Mustang " / "CDBL Rockets 10u IHTT" style prefixes
  let cleaned = teamName
    .replace(/^CDBL\s+Rockets?\s+/i, "")
    .replace(/^CDBL\s+/i, "")
    .trim();
  if (divisionName) {
    cleaned = cleaned.replace(new RegExp(`^${divisionName}\\s+`, "i"), "").trim();
  }
  return cleaned;
}

// Splits a game-style title on "vs" / "@" / "at" separators. Returns null if no split.
function splitVersus(title: string): [string, string] | null {
  const m = title.match(/^(.+?)\s+(?:vs\.?|@|at)\s+(.+)$/i);
  if (!m) return null;
  return [m[1].trim(), m[2].trim()];
}

function findTeam(
  rawName: string,
  divisionId: string | null,
  teams: TeamRow[],
): string | null {
  const cleaned = rawName.trim();
  if (!cleaned) return null;
  const lower = cleaned.toLowerCase();

  // Try exact match within division first
  if (divisionId) {
    const inDiv = teams.find(
      (t) =>
        t.division_id === divisionId && t.name.toLowerCase() === lower,
    );
    if (inDiv) return inDiv.id;

    // substring match within division
    const partial = teams.find(
      (t) =>
        t.division_id === divisionId &&
        (lower.includes(t.name.toLowerCase()) ||
          t.name.toLowerCase().includes(lower)),
    );
    if (partial) return partial.id;

    // IMPORTANT: If we know the division but no team matched within it, do NOT
    // fall back to a same-name team in a different division — that mismatch is
    // exactly how a Pinto game ends up pointing at the Bronco "Rays".
    return null;
  }

  // No division detected — fall back to any-division exact match
  const any = teams.find((t) => t.name.toLowerCase() === lower);
  return any?.id ?? null;
}

function classify(
  event: ParsedEvent,
  divisions: DivisionRow[],
  teams: TeamRow[],
  programs: ProgramRow[],
): Classification {
  const title = event.summary ?? "";
  const desc = event.description ?? "";
  const loc = event.location ?? "";
  const haystack = `${title} ${desc}`;

  // 1. Category
  let category: Classification["event_category"] = "event";
  const isPracticeTitle = /\bvs\s+practice\b/i.test(title) ||
    /\bpractice\b/i.test(title);
  const isPracticeDesc = /\bpractice\b/i.test(desc);
  const versusParts = splitVersus(title);
  const hasVs = versusParts !== null;

  if (isPracticeTitle || (isPracticeDesc && !hasVs)) {
    category = "practice";
  } else if (hasVs) {
    category = "game";
  } else if (isPracticeDesc) {
    category = "practice";
  }

  // 2. Division
  const division = detectDivision(haystack, divisions);

  // 3. Program
  let programId: string | null = division?.program_id ?? null;
  if (!programId) {
    const isTravel = /\b(travel|ihtt|rockets|\d{1,2}u)\b/i.test(haystack);
    const program = programs.find(
      (p) => p.type === (isTravel ? "travel" : "in_house"),
    );
    programId = program?.id ?? null;
  }

  // 4. Teams
  let homeTeamId: string | null = null;
  let awayTeamId: string | null = null;

  if (category === "game" && versusParts) {
    const [left, right] = versusParts;
    const homeName = stripDivisionPrefix(left, division?.name ?? "");
    const awayName = stripDivisionPrefix(right, division?.name ?? "");
    homeTeamId = findTeam(homeName, division?.id ?? null, teams);
    awayTeamId = findTeam(awayName, division?.id ?? null, teams);
  } else if (category === "practice") {
    // Title like "Mustang Pirates vs Practice" or "CDBL Rockets 10u IHTT vs Practice"
    let teamPart = title;
    const vsIdx = title.search(/\s+(?:vs\.?|@|at)\s+/i);
    if (vsIdx > 0) teamPart = title.slice(0, vsIdx);
    teamPart = teamPart.replace(/\bpractice\b/i, "").trim();
    const cleaned = stripDivisionPrefix(teamPart, division?.name ?? "");
    homeTeamId = findTeam(cleaned, division?.id ?? null, teams);
  }

  // 5. Field number
  const fieldMatch = loc.match(FIELD_RE) ?? title.match(FIELD_RE);
  const fieldNumber = fieldMatch ? fieldMatch[1] : null;

  return {
    event_category: category,
    program_id: programId,
    division_id: division?.id ?? null,
    home_team_id: homeTeamId,
    away_team_id: awayTeamId,
    field_number: fieldNumber,
  };
}

// ---------- Main handler ----------

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = req.method === "POST"
      ? await req.json().catch(() => ({}))
      : {};
    const calendarId: string | undefined = body?.calendar_id;

    // Load lookups once
    const [divRes, teamRes, progRes] = await Promise.all([
      supabase.from("divisions").select("id, name, program_id"),
      supabase.from("teams").select("id, name, division_id"),
      supabase.from("programs").select("id, type"),
    ]);

    if (divRes.error) throw new Error(`divisions: ${divRes.error.message}`);
    if (teamRes.error) throw new Error(`teams: ${teamRes.error.message}`);
    if (progRes.error) throw new Error(`programs: ${progRes.error.message}`);

    const programs: ProgramRow[] = (progRes.data ?? []) as ProgramRow[];
    const programTypeById = new Map(programs.map((p) => [p.id, p.type]));

    const divisions: DivisionRow[] = (divRes.data ?? []).map((d: any) => ({
      id: d.id,
      name: d.name,
      program_id: d.program_id,
      program_type: programTypeById.get(d.program_id) ?? "",
    }));
    const teams: TeamRow[] = (teamRes.data ?? []) as TeamRow[];

    // Fetch calendars to sync
    const { data: calendars, error: calErr } = await supabase
      .from("external_calendars")
      .select("*")
      .eq("is_active", true)
      .match(calendarId ? { id: calendarId } : {});

    if (calErr) throw calErr;
    if (!calendars || calendars.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active calendars to sync", results: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const results: Array<Record<string, unknown>> = [];

    for (const cal of calendars) {
      try {
        const res = await fetch(cal.ical_url, {
          headers: { "User-Agent": "CDBL-Calendar-Sync/1.0" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        const parsed = parseICal(text);

        if (parsed.length === 0) {
          await supabase
            .from("external_calendars")
            .update({
              last_synced_at: new Date().toISOString(),
              last_sync_status: "warning",
              last_sync_message: "No events parsed from feed",
            })
            .eq("id", cal.id);
          results.push({ calendar_id: cal.id, synced: 0, status: "warning" });
          continue;
        }

        // Classify + build rows
        let games = 0, practices = 0, events = 0, unmatched = 0, skippedBronco = 0;
        const divisionNameById = new Map<string, string>();
        divisions.forEach((d) => divisionNameById.set(d.id, d.name));
        const rows = await Promise.all(
          parsed
            .map((e) => {
              const c = classify(e, divisions, teams, programs);
              return { e, c };
            })
            .filter(({ c }) => {
              // Exclude Bronco games per league policy — there are no Bronco games.
              const divName = c.division_id ? divisionNameById.get(c.division_id) : null;
              if (c.event_category === "game" && divName?.toLowerCase() === "bronco") {
                skippedBronco++;
                return false;
              }
              return true;
            })
            .map(async ({ e, c }) => {
              if (c.event_category === "game") games++;
              else if (c.event_category === "practice") practices++;
              else events++;
              if (!c.division_id) unmatched++;

              const { title, isCancelled } = detectCancellation(e.summary);
              const facility = parseFacilityPath(e.description);

              return {
                calendar_id: cal.id,
                calendar_name: cal.name,
                calendar_color: cal.color,
                external_uid: e.uid, // feed provenance only — NOT stable across syncs
                event_key: await eventKey(cal.id, e.summary, e.startDate, e.startTime),
                title,
                is_cancelled: isCancelled,
                description: e.description ?? null,
                location: e.location ?? null,
                start_date: e.startDate,
                start_time: e.startTime ?? null,
                end_date: e.endDate ?? null,
                end_time: e.endTime ?? null,
                all_day: e.allDay,
                raw_data: e.raw,
                event_category: c.event_category,
                program_id: c.program_id,
                division_id: c.division_id,
                home_team_id: c.home_team_id,
                away_team_id: c.away_team_id,
                field_number: c.field_number,
                ...facility,
                status: "active",
                last_seen_at: nowIso,
              };
            }),
        );

        // ---- Reconcile against what is already stored ----
        const { data: existing, error: exErr } = await supabase
          .from("external_calendar_events")
          .select(
            "id, event_key, title, is_cancelled, description, location, start_date, start_time, end_date, end_time, all_day, event_category, program_id, division_id, home_team_id, away_team_id, field_number, facility_path, status",
          )
          .eq("calendar_id", cal.id);
        if (exErr) throw exErr;

        const byKey = new Map((existing ?? []).map((r: any) => [r.event_key, r]));
        const feedKeys = new Set(rows.map((r) => r.event_key));

        const toInsert = rows.filter((r) => !byKey.has(r.event_key));
        const toUpdate = rows.filter(
          (r) => byKey.has(r.event_key) && differs(byKey.get(r.event_key), r),
        );
        const unchanged = rows.length - toInsert.length - toUpdate.length;
        const toRemove = (existing ?? []).filter(
          (r: any) => r.status === "active" && !feedKeys.has(r.event_key),
        );

        if (dryRun) {
          results.push({
            calendar_id: cal.id,
            name: cal.name,
            dry_run: true,
            feed_events: rows.length,
            would_insert: toInsert.length,
            would_update: toUpdate.length,
            would_remove: toRemove.length,
            unchanged,
            skipped_bronco: skippedBronco,
          });
          continue; // no writes at all, last_sync_* untouched
        }

        // Upsert on the stable key — preserves id and created_at for existing rows.
        const { error: upErr } = await supabase
          .from("external_calendar_events")
          .upsert(
            rows.map((r) => ({ ...r, removed_at: null, updated_at: nowIso })),
            { onConflict: "calendar_id,event_key" },
          );
        if (upErr) throw upErr;

        // Soft delete anything that vanished from the feed. Never a hard DELETE:
        // other tables will reference external_calendar_events(id).
        if (toRemove.length) {
          const { error: rmErr } = await supabase
            .from("external_calendar_events")
            .update({ status: "removed", removed_at: nowIso, updated_at: nowIso })
            .in("id", toRemove.map((r: any) => r.id));
          if (rmErr) throw rmErr;
        }

        const summary =
          `Synced ${rows.length} events (${toInsert.length} new, ${toUpdate.length} updated, ${unchanged} unchanged, ${toRemove.length} removed; ${games} games, ${practices} practices, ${events} other; ${unmatched} unmatched; skipped ${skippedBronco} Bronco game${skippedBronco === 1 ? "" : "s"})`;

        await supabase
          .from("external_calendars")
          .update({
            last_synced_at: nowIso,
            last_sync_status: "success",
            last_sync_message: summary,
          })
          .eq("id", cal.id);

        results.push({
          calendar_id: cal.id,
          name: cal.name,
          synced: rows.length,
          inserted: toInsert.length,
          updated: toUpdate.length,
          unchanged,
          removed: toRemove.length,
          games,
          practices,
          events,
          unmatched,
          status: "success",
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await supabase
          .from("external_calendars")
          .update({
            last_synced_at: new Date().toISOString(),
            last_sync_status: "error",
            last_sync_message: msg,
          })
          .eq("id", cal.id);
        results.push({ calendar_id: cal.id, status: "error", error: msg });
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
