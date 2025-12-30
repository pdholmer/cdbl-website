import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateDraftData {
  name: string;
  division_id?: string;
  program_id?: string;
  season_year: number;
  draft_type?: string;
  scheduled_start?: string;
  pick_time_limit?: number;
  auto_pick_enabled?: boolean;
  total_rounds?: number;
}

interface UpdateDraftData extends Partial<CreateDraftData> {
  id: string;
  status?: string;
  current_round?: number;
  current_pick?: number;
  actual_start?: string;
  completed_at?: string;
}

interface MakePickData {
  draft_id: string;
  draft_team_id: string;
  player_id: string;
  round_number: number;
  pick_number: number;
  pick_in_round: number;
  is_auto_pick?: boolean;
  time_spent?: number;
}

export const useDraftMutations = () => {
  const queryClient = useQueryClient();

  const createDraft = useMutation({
    mutationFn: async (data: CreateDraftData) => {
      const { data: result, error } = await supabase
        .from("drafts")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drafts"] });
      toast.success("Draft created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create draft: ${error.message}`);
    },
  });

  const updateDraft = useMutation({
    mutationFn: async ({ id, ...data }: UpdateDraftData) => {
      const { data: result, error } = await supabase
        .from("drafts")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["drafts"] });
      queryClient.invalidateQueries({ queryKey: ["draft", variables.id] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update draft: ${error.message}`);
    },
  });

  const deleteDraft = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("drafts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drafts"] });
      toast.success("Draft deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete draft: ${error.message}`);
    },
  });

  const makePick = useMutation({
    mutationFn: async (data: MakePickData) => {
      // Insert the pick
      const { data: pick, error: pickError } = await supabase
        .from("draft_picks")
        .insert(data)
        .select()
        .single();

      if (pickError) throw pickError;

      // Mark player as unavailable in pool
      const { error: poolError } = await supabase
        .from("draft_player_pool")
        .update({ is_available: false })
        .eq("draft_id", data.draft_id)
        .eq("player_id", data.player_id);

      if (poolError) throw poolError;

      // Advance the draft pick counter
      const { error: draftError } = await supabase
        .from("drafts")
        .update({ current_pick: data.pick_number + 1 })
        .eq("id", data.draft_id);

      if (draftError) throw draftError;

      return pick;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["draft", variables.draft_id] });
      queryClient.invalidateQueries({ queryKey: ["draft-picks", variables.draft_id] });
      queryClient.invalidateQueries({ queryKey: ["draft-player-pool", variables.draft_id] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to make pick: ${error.message}`);
    },
  });

  return {
    createDraft,
    updateDraft,
    deleteDraft,
    makePick,
  };
};
