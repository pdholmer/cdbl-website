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
  startDate: string; // YYYY-MM-DD
  startTime?: string; // HH:MM:SS
  endDate?: string;
  endTime?: string;
  allDay: boolean;
  raw: Record<string, string>;
}

// Unfold long lines (RFC5545: lines starting with space/tab continue prev line)
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

// Parse DTSTART/DTEND value -> { date, time?, allDay }
function parseDateTime(propLine: string): {
  date: string;
  time?: string;
  allDay: boolean;
} | null {
  // propLine looks like: DTSTART;TZID=America/Chicago:20260415T180000
  // or DTSTART;VALUE=DATE:20260415
  // or DTSTART:20260415T180000Z
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
  const date = `${m[1]}-${m[2]}-${m[3]}`;
  const time = `${m[4]}:${m[5]}:${m[6]}`;
  // Note: We're storing local time as-is. TZID is informational.
  // For UTC (Z suffix), we could convert, but most calendars include local TZID.
  return { date, time, allDay: false };
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
      // Extract property name (before ; or :)
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const calendarId: string | undefined = body?.calendar_id;

    // Fetch calendars to sync
    const { data: calendars, error: calErr } = await supabase
      .from("external_calendars")
      .select("*")
      .eq("is_active", true)
      .match(calendarId ? { id: calendarId } : {});

    if (calErr) throw calErr;
    if (!calendars || calendars.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active calendars to sync", synced: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const results: Array<Record<string, unknown>> = [];

    for (const cal of calendars) {
      try {
        const res = await fetch(cal.ical_url, {
          headers: { "User-Agent": "CDBL-Calendar-Sync/1.0" },
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
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

        // Upsert events
        const rows = parsed.map((e) => ({
          calendar_id: cal.id,
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
        }));

        const { error: upErr } = await supabase
          .from("external_calendar_events")
          .upsert(rows, { onConflict: "calendar_id,external_uid" });
        if (upErr) throw upErr;

        // Delete events no longer in feed
        const uids = parsed.map((e) => e.uid);
        const { error: delErr } = await supabase
          .from("external_calendar_events")
          .delete()
          .eq("calendar_id", cal.id)
          .not("external_uid", "in", `(${uids.map((u) => `"${u.replace(/"/g, '\\"')}"`).join(",")})`);
        if (delErr) console.error("Delete error:", delErr);

        await supabase
          .from("external_calendars")
          .update({
            last_synced_at: new Date().toISOString(),
            last_sync_status: "success",
            last_sync_message: `Synced ${parsed.length} events`,
          })
          .eq("id", cal.id);

        results.push({
          calendar_id: cal.id,
          name: cal.name,
          synced: parsed.length,
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
