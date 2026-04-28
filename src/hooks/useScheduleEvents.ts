import { useMemo } from "react";
import { useGames } from "@/hooks/useGames";
import { usePractices } from "@/hooks/usePractices";
import { useLeagueEvents } from "@/hooks/useLeagueEvents";
import { useExternalCalendarEvents } from "@/hooks/useExternalCalendars";
import { useTeams } from "@/hooks/useTeams";
import { useTeamHierarchy } from "@/hooks/useTeamHierarchy";
import { CalendarEvent } from "@/data/calendarEvents";
import { Trophy, Users, Calendar, CalendarDays } from "lucide-react";

// Normalize any time string to 12-hour standard format (e.g. "7:00 PM").
// Accepts "HH:MM", "HH:MM:SS", "H:MM AM/PM", or ranges like "5:30 PM - 7:00 PM".
const formatTime = (input?: string | null): string | undefined => {
  if (!input) return undefined;
  const str = String(input).trim();
  if (!str) return undefined;

  const convertOne = (token: string): string => {
    const t = token.trim();
    // Already in 12-hour format
    if (/[ap]\.?m\.?$/i.test(t)) {
      const m = t.match(/^(\d{1,2}):?(\d{2})?\s*([ap])\.?m\.?$/i);
      if (m) {
        const h = parseInt(m[1], 10);
        const min = m[2] ?? "00";
        const ap = m[3].toUpperCase() + "M";
        return `${h}:${min} ${ap}`;
      }
      return t;
    }
    // 24-hour HH:MM(:SS)
    const m24 = t.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (m24) {
      let h = parseInt(m24[1], 10);
      const min = m24[2];
      const ap = h >= 12 ? "PM" : "AM";
      h = h % 12;
      if (h === 0) h = 12;
      return `${h}:${min} ${ap}`;
    }
    return t;
  };

  // Handle range with dash
  const rangeMatch = str.split(/\s*[-–—]\s*/);
  if (rangeMatch.length === 2) {
    return `${convertOne(rangeMatch[0])} - ${convertOne(rangeMatch[1])}`;
  }
  return convertOne(str);
};

export const useScheduleEvents = () => {
  const { data: games, isLoading: gamesLoading } = useGames();
  const { data: practices, isLoading: practicesLoading } = usePractices();
  const { data: leagueEvents, isLoading: eventsLoading } = useLeagueEvents();
  const { data: externalEvents, isLoading: externalLoading } =
    useExternalCalendarEvents();
  const { data: teams } = useTeams();

  const events = useMemo(() => {
    // Map games to CalendarEvent format
    const gameEvents: CalendarEvent[] = (games || []).map((g) => ({
      id: `game-${g.id}`,
      title: `${g.home_team?.name || "TBD"} vs ${g.away_team?.name || "TBD"}`,
      date: g.game_date,
      time: formatTime(g.game_time),
      location: g.venue?.name || undefined,
      category: "game" as const,
      type: "games-start" as const,
      description: `${g.game_type} game${g.notes ? `: ${g.notes}` : ""}`,
      icon: Trophy,
      divisionId: g.division_id || undefined,
      homeTeamId: g.home_team_id || undefined,
      awayTeamId: g.away_team_id || undefined,
    }));

    // Map practices to CalendarEvent format
    const practiceEvents: CalendarEvent[] = (practices || []).map((p) => ({
      id: `practice-${p.id}`,
      title: `${p.team?.name || "Team"} Practice`,
      date: p.practice_date,
      time: formatTime(p.start_time),
      location: p.venue?.name || undefined,
      category: "practice" as const,
      type: "practices-start" as const,
      description: p.notes || `${p.practice_type || "Regular"} practice`,
      icon: Users,
      teamId: p.team_id,
    }));

    // Map DB league events to CalendarEvent format
    const dbEvents: CalendarEvent[] = (leagueEvents || []).map((e) => ({
      id: `event-${e.id}`,
      title: e.title,
      date: e.event_date,
      endDate: e.end_date || undefined,
      time: formatTime(e.event_time),
      location: e.location || undefined,
      category: "event" as const,
      type: (e.event_type || "special-event") as CalendarEvent["type"],
      description: e.description || "",
      icon: Calendar,
    }));

    // Quick team-name lookup for nicer titles
    const teamNameById = new Map<string, string>();
    (teams || []).forEach((t: any) => teamNameById.set(t.id, t.name));

    // Division/program lookups via team relations
    const divisionNameByTeamId = new Map<string, string | undefined>();
    (teams || []).forEach((t: any) =>
      divisionNameByTeamId.set(t.id, t.division?.name)
    );
    const programTypeByTeamId = new Map<string, string | undefined>();
    (teams || []).forEach((t: any) =>
      programTypeByTeamId.set(t.id, t.program?.type)
    );

    // Clean raw external title: strip CDBL Rockets / CDBL prefixes, collapse whitespace
    const cleanRawTitle = (raw: string): string =>
      raw
        .replace(/\bCDBL\s+Rockets?\s+/gi, "")
        .replace(/^CDBL\s+/i, "")
        .replace(/\s+/g, " ")
        .trim();

    // Strip leading division prefix from a team string ("Mustang Pirates" -> "Pirates")
    const stripDivPrefix = (teamName: string, divName?: string): string => {
      let s = teamName
        .replace(/\bCDBL\s+Rockets?\s+/gi, "")
        .replace(/^CDBL\s+/i, "")
        .trim();
      if (divName) {
        s = s.replace(new RegExp(`^${divName}\\s+`, "i"), "").trim();
      }
      return s;
    };

    // Map external (synced) calendar events with classification
    const extEvents: CalendarEvent[] = (externalEvents || []).map((e) => {
      const cat = (e.event_category as CalendarEvent["category"]) || "event";
      const icon = cat === "game"
        ? Trophy
        : cat === "practice"
          ? Users
          : CalendarDays;

      const divName =
        (e.home_team_id && divisionNameByTeamId.get(e.home_team_id)) ||
        (e.away_team_id && divisionNameByTeamId.get(e.away_team_id)) ||
        undefined;
      const programType =
        (e.home_team_id && programTypeByTeamId.get(e.home_team_id)) ||
        (e.away_team_id && programTypeByTeamId.get(e.away_team_id)) ||
        undefined;
      const isTravel = programType === "travel";

      let title = cleanRawTitle(e.title);
      const homeName = e.home_team_id ? teamNameById.get(e.home_team_id) : undefined;
      const awayName = e.away_team_id ? teamNameById.get(e.away_team_id) : undefined;

      if (cat === "game" && homeName && awayName) {
        if (isTravel) {
          title = `${homeName} vs ${awayName}`;
        } else if (divName) {
          const h = stripDivPrefix(homeName, divName);
          const a = stripDivPrefix(awayName, divName);
          title = `${divName}: ${h} vs ${a}`;
        } else {
          title = `${homeName} vs ${awayName}`;
        }
      } else if (cat === "practice" && homeName) {
        if (isTravel) {
          title = `${homeName} Practice`;
        } else if (divName) {
          const h = stripDivPrefix(homeName, divName);
          title = `${divName} ${h} Practice`;
        } else {
          title = `${homeName} Practice`;
        }
      }

      const type: CalendarEvent["type"] = cat === "game"
        ? "games-start"
        : cat === "practice"
          ? "practices-start"
          : "special-event";

      return {
        id: `ext-${e.id}`,
        title,
        date: e.start_date,
        endDate: e.end_date || undefined,
        time: formatTime(e.start_time),
        location: e.location || undefined,
        category: cat,
        type,
        description:
          e.description || (e.calendar?.name ? `From ${e.calendar.name}` : ""),
        icon,
        programId: e.program_id || undefined,
        divisionId: e.division_id || undefined,
        teamId: cat === "practice" ? (e.home_team_id || undefined) : undefined,
        homeTeamId: e.home_team_id || undefined,
        awayTeamId: e.away_team_id || undefined,
      };
    });

    return [...gameEvents, ...practiceEvents, ...dbEvents, ...extEvents];
  }, [games, practices, leagueEvents, externalEvents, teams]);

  return {
    events,
    isLoading:
      gamesLoading || practicesLoading || eventsLoading || externalLoading,
  };
};
