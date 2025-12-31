import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface DashboardStats {
  // Player stats
  totalPlayers: number;
  pendingRegistrations: number;
  unpaidRegistrations: number;
  
  // Team stats
  totalTeams: number;
  activeTeams: number;
  teamsNeedingCoaches: number;
  
  // Game stats
  todayGames: number;
  upcomingGames: Array<{
    id: string;
    homeTeam: string;
    awayTeam: string;
    date: string;
    time: string;
    venue: string;
  }>;
  
  // Feedback stats
  pendingFeedback: number;
  processingFeedback: number;
  criticalFeedback: number;
  highPriorityFeedback: number;
  
  // Draft stats
  activeDrafts: number;
  upcomingDrafts: number;
  liveDraft: {
    id: string;
    name: string;
    currentRound: number;
    totalRounds: number;
  } | null;
  
  // Coach stats
  pendingInvitations: number;
}

export const useAdminDashboardStats = () => {
  return useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const today = format(new Date(), "yyyy-MM-dd");
      
      // Fetch all data in parallel
      const [
        playersResult,
        teamsResult,
        gamesResult,
        upcomingGamesResult,
        feedbackResult,
        draftsResult,
        invitationsResult,
      ] = await Promise.all([
        // Players
        supabase
          .from("players")
          .select("status, payment_status"),
        
        // Teams with coaches
        supabase
          .from("teams")
          .select(`
            status,
            team_coaches(id)
          `),
        
        // Today's games
        supabase
          .from("games")
          .select("id")
          .eq("game_date", today)
          .neq("status", "cancelled"),
        
        // Upcoming games (next 5)
        supabase
          .from("games")
          .select(`
            id,
            game_date,
            game_time,
            home_team:teams!games_home_team_id_fkey(name),
            away_team:teams!games_away_team_id_fkey(name),
            venue:venues(name)
          `)
          .gte("game_date", today)
          .neq("status", "cancelled")
          .order("game_date", { ascending: true })
          .order("game_time", { ascending: true })
          .limit(5),
        
        // Feedback
        supabase
          .from("platform_feedback")
          .select("status, priority"),
        
        // Drafts
        supabase
          .from("drafts")
          .select("id, name, status, current_round, total_rounds"),
        
        // Coach invitations
        supabase
          .from("coach_invitations")
          .select("id")
          .eq("status", "pending"),
      ]);

      // Process players
      const players = playersResult.data || [];
      const pendingRegistrations = players.filter(p => p.status === "pending" || p.status === "registered").length;
      const unpaidRegistrations = players.filter(p => p.payment_status === "pending" || p.payment_status === "unpaid").length;

      // Process teams
      const teams = teamsResult.data || [];
      const activeTeams = teams.filter(t => t.status === "active").length;
      const teamsNeedingCoaches = teams.filter(t => 
        t.status === "active" && (!t.team_coaches || t.team_coaches.length === 0)
      ).length;

      // Process feedback
      const feedback = feedbackResult.data || [];
      const pendingFeedback = feedback.filter(f => f.status === "pending").length;
      const processingFeedback = feedback.filter(f => f.status === "processing").length;
      const criticalFeedback = feedback.filter(f => f.priority === "critical" && f.status !== "complete" && f.status !== "closed").length;
      const highPriorityFeedback = feedback.filter(f => f.priority === "high" && f.status !== "complete" && f.status !== "closed").length;

      // Process drafts
      const drafts = draftsResult.data || [];
      const activeDrafts = drafts.filter(d => d.status === "active" || d.status === "in_progress").length;
      const upcomingDrafts = drafts.filter(d => d.status === "scheduled" || d.status === "pending").length;
      const liveDraftData = drafts.find(d => d.status === "in_progress" || d.status === "active");
      const liveDraft = liveDraftData ? {
        id: liveDraftData.id,
        name: liveDraftData.name,
        currentRound: liveDraftData.current_round || 1,
        totalRounds: liveDraftData.total_rounds || 10,
      } : null;

      // Process upcoming games
      const upcomingGames = (upcomingGamesResult.data || []).map(g => ({
        id: g.id,
        homeTeam: (g.home_team as { name: string })?.name || "TBD",
        awayTeam: (g.away_team as { name: string })?.name || "TBD",
        date: g.game_date,
        time: g.game_time,
        venue: (g.venue as { name: string })?.name || "TBD",
      }));

      const stats: DashboardStats = {
        totalPlayers: players.length,
        pendingRegistrations,
        unpaidRegistrations,
        totalTeams: teams.length,
        activeTeams,
        teamsNeedingCoaches,
        todayGames: gamesResult.data?.length || 0,
        upcomingGames,
        pendingFeedback,
        processingFeedback,
        criticalFeedback,
        highPriorityFeedback,
        activeDrafts,
        upcomingDrafts,
        liveDraft,
        pendingInvitations: invitationsResult.data?.length || 0,
      };

      return stats;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
