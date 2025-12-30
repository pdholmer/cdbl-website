import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DraftPick {
  id: string;
  draft_id: string;
  draft_team_id: string;
  player_id: string;
  round_number: number;
  pick_number: number;
  pick_in_round: number;
  picked_at: string;
  is_auto_pick: boolean;
  time_spent: number | null;
  created_at: string;
  player: {
    id: string;
    first_name: string;
    last_name: string;
  };
  draft_team: {
    id: string;
    team_id: string;
    draft_order: number;
    team: {
      id: string;
      name: string;
      nickname: string | null;
      color_primary: string | null;
    } | null;
  };
}

export const useDraftPicks = (draftId: string | undefined) => {
  return useQuery({
    queryKey: ["draft-picks", draftId],
    queryFn: async () => {
      if (!draftId) return [];

      const { data, error } = await supabase
        .from("draft_picks")
        .select(`
          *,
          player:players(id, first_name, last_name),
          draft_team:draft_teams(
            id,
            team_id,
            draft_order,
            team:teams(id, name, nickname, color_primary)
          )
        `)
        .eq("draft_id", draftId)
        .order("pick_number");

      if (error) throw error;
      return data as DraftPick[];
    },
    enabled: !!draftId,
  });
};

export const useTeamPicks = (draftTeamId: string | undefined) => {
  return useQuery({
    queryKey: ["draft-team-picks", draftTeamId],
    queryFn: async () => {
      if (!draftTeamId) return [];

      const { data, error } = await supabase
        .from("draft_picks")
        .select(`
          *,
          player:players(id, first_name, last_name, age_at_registration, skill_level)
        `)
        .eq("draft_team_id", draftTeamId)
        .order("pick_number");

      if (error) throw error;
      return data;
    },
    enabled: !!draftTeamId,
  });
};
