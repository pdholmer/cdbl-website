import { useMemo } from "react";
import { useGames } from "@/hooks/useGames";
import { usePractices } from "@/hooks/usePractices";
import { useLeagueEvents } from "@/hooks/useLeagueEvents";
import { CalendarEvent } from "@/data/calendarEvents";
import { Trophy, Users, Calendar } from "lucide-react";

export const useScheduleEvents = () => {
  const { data: games, isLoading: gamesLoading } = useGames();
  const { data: practices, isLoading: practicesLoading } = usePractices();
  const { data: leagueEvents, isLoading: eventsLoading } = useLeagueEvents();

  const events = useMemo(() => {
    // Map games to CalendarEvent format
    const gameEvents: CalendarEvent[] = (games || []).map((g) => ({
      id: `game-${g.id}`,
      title: `${g.home_team?.name || "TBD"} vs ${g.away_team?.name || "TBD"}`,
      date: g.game_date,
      time: g.game_time,
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
      time: p.start_time,
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
      time: e.event_time || undefined,
      location: e.location || undefined,
      category: "event" as const,
      type: (e.event_type || "special-event") as CalendarEvent["type"],
      description: e.description || "",
      icon: Calendar,
    }));

    return [...gameEvents, ...practiceEvents, ...dbEvents];
  }, [games, practices, leagueEvents]);

  return {
    events,
    isLoading: gamesLoading || practicesLoading || eventsLoading,
  };
};
