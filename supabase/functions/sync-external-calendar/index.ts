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
        const rows = parsed
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
          .map(({ e, c }) => {
            if (c.event_category === "game") games++;
            else if (c.event_category === "practice") practices++;
            else events++;
            if (!c.division_id) unmatched++;
            return {
              calendar_id: cal.id,
              calendar_name: cal.name,
              calendar_color: cal.color,
              external_uid: e.uid,
              title: e.summary,
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
            };
          });

        const { error: upErr } = await supabase
          .from("external_calendar_events")
          .upsert(rows, { onConflict: "calendar_id,external_uid" });
        if (upErr) throw upErr;

        // Delete events no longer in feed (also removes any previously-synced
        // Bronco games, since their UIDs are no longer in the kept rows).
        const keepUids = rows.map((r) => r.external_uid);
        const { error: delErr } = await supabase
          .from("external_calendar_events")
          .delete()
          .eq("calendar_id", cal.id)
          .not(
            "external_uid",
            "in",
            `(${keepUids.map((u) => `"${u.replace(/"/g, '\\"')}"`).join(",")})`,
          );
        if (delErr) console.error("Delete error:", delErr);

        const summary =
          `Synced ${rows.length} events (${games} games, ${practices} practices, ${events} other; ${unmatched} unmatched; skipped ${skippedBronco} Bronco game${skippedBronco === 1 ? "" : "s"})`;

        await supabase
          .from("external_calendars")
          .update({
            last_synced_at: new Date().toISOString(),
            last_sync_status: "success",
            last_sync_message: summary,
          })
          .eq("id", cal.id);

        results.push({
          calendar_id: cal.id,
          name: cal.name,
          synced: parsed.length,
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
