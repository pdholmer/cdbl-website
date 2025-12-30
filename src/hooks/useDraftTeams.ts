import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DraftTeam {
  id: string;
  draft_id: string;
  team_id: string;
  coach_user_id: string | null;
  draft_order: number;
  is_ready: boolean;
  auto_pick_enabled: boolean;
  created_at: string;
  team?: {
    id: string;
    name: string;
    nickname: string | null;
    color_primary: string | null;
  } | null;
  coach?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

export const useDraftTeams = (draftId: string | undefined) => {
  return useQuery({
    queryKey: ["draft-teams", draftId],
    queryFn: async () => {
      if (!draftId) return [];

      const { data, error } = await supabase
        .from("draft_teams")
        .select(`
          *,
          team:teams(id, name, nickname, color_primary)
        `)
        .eq("draft_id", draftId)
        .order("draft_order");

      if (error) throw error;

      // Fetch coaches separately since coach_user_id references auth.users
      const teamsWithCoaches = await Promise.all(
        (data || []).map(async (dt) => {
          if (dt.coach_user_id) {
            const { data: coach } = await supabase
              .from("coaches")
              .select("id, first_name, last_name, email")
              .eq("user_id", dt.coach_user_id)
              .single();
            return { ...dt, coach } as DraftTeam;
          }
          return { ...dt, coach: null } as DraftTeam;
        })
      );

      return teamsWithCoaches;
    },
    enabled: !!draftId,
  });
};

interface AddDraftTeamData {
  draft_id: string;
  team_id: string;
  draft_order: number;
  coach_user_id?: string;
}

interface UpdateDraftTeamData {
  id: string;
  is_ready?: boolean;
  auto_pick_enabled?: boolean;
  coach_user_id?: string;
  draft_order?: number;
}

export const useDraftTeamMutations = () => {
  const queryClient = useQueryClient();

  const addTeam = useMutation({
    mutationFn: async (data: AddDraftTeamData) => {
      const { data: result, error } = await supabase
        .from("draft_teams")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["draft-teams", variables.draft_id] });
      toast.success("Team added to draft");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add team: ${error.message}`);
    },
  });

  const updateTeam = useMutation({
    mutationFn: async ({ id, ...data }: UpdateDraftTeamData) => {
      const { data: result, error } = await supabase
        .from("draft_teams")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["draft-teams"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update team: ${error.message}`);
    },
  });

  const removeTeam = useMutation({
    mutationFn: async ({ id, draftId }: { id: string; draftId: string }) => {
      const { error } = await supabase.from("draft_teams").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["draft-teams", variables.draftId] });
      toast.success("Team removed from draft");
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove team: ${error.message}`);
    },
  });

  const randomizeOrder = useMutation({
    mutationFn: async (draftId: string) => {
      // Get current teams
      const { data: teams, error: fetchError } = await supabase
        .from("draft_teams")
        .select("id")
        .eq("draft_id", draftId);

      if (fetchError) throw fetchError;
      if (!teams || teams.length === 0) return;

      // Shuffle the teams
      const shuffled = [...teams].sort(() => Math.random() - 0.5);

      // Update each team with new order
      for (let i = 0; i < shuffled.length; i++) {
        const { error } = await supabase
          .from("draft_teams")
          .update({ draft_order: i + 1 })
          .eq("id", shuffled[i].id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["draft-teams"] });
      toast.success("Draft order randomized");
    },
    onError: (error: Error) => {
      toast.error(`Failed to randomize order: ${error.message}`);
    },
  });

  return {
    addTeam,
    updateTeam,
    removeTeam,
    randomizeOrder,
  };
};
