import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface QueuedPlayer {
  id: string;
  draft_team_id: string;
  player_id: string;
  queue_order: number;
  created_at: string;
  player: {
    id: string;
    first_name: string;
    last_name: string;
    age_at_registration: number | null;
    skill_level: string | null;
  };
}

export const useDraftPlayerQueue = (draftTeamId: string | undefined) => {
  return useQuery({
    queryKey: ["draft-player-queue", draftTeamId],
    queryFn: async () => {
      if (!draftTeamId) return [];

      const { data, error } = await supabase
        .from("draft_player_queues")
        .select(`
          *,
          player:players(id, first_name, last_name, age_at_registration, skill_level)
        `)
        .eq("draft_team_id", draftTeamId)
        .order("queue_order");

      if (error) throw error;
      return data as QueuedPlayer[];
    },
    enabled: !!draftTeamId,
  });
};

interface AddToQueueData {
  draft_team_id: string;
  player_id: string;
  queue_order: number;
}

interface ReorderQueueData {
  draft_team_id: string;
  player_ids: string[]; // Ordered array of player IDs
}

export const useDraftPlayerQueueMutations = () => {
  const queryClient = useQueryClient();

  const addToQueue = useMutation({
    mutationFn: async (data: AddToQueueData) => {
      const { data: result, error } = await supabase
        .from("draft_player_queues")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["draft-player-queue", variables.draft_team_id] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to add to queue: ${error.message}`);
    },
  });

  const removeFromQueue = useMutation({
    mutationFn: async ({ id, draftTeamId }: { id: string; draftTeamId: string }) => {
      const { error } = await supabase.from("draft_player_queues").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["draft-player-queue", variables.draftTeamId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove from queue: ${error.message}`);
    },
  });

  const reorderQueue = useMutation({
    mutationFn: async ({ draft_team_id, player_ids }: ReorderQueueData) => {
      // Delete all existing queue items for this team
      const { error: deleteError } = await supabase
        .from("draft_player_queues")
        .delete()
        .eq("draft_team_id", draft_team_id);

      if (deleteError) throw deleteError;

      // Insert new order
      const newQueueItems = player_ids.map((player_id, index) => ({
        draft_team_id,
        player_id,
        queue_order: index + 1,
      }));

      const { error: insertError } = await supabase
        .from("draft_player_queues")
        .insert(newQueueItems);

      if (insertError) throw insertError;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["draft-player-queue", variables.draft_team_id] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to reorder queue: ${error.message}`);
    },
  });

  const clearQueue = useMutation({
    mutationFn: async (draftTeamId: string) => {
      const { error } = await supabase
        .from("draft_player_queues")
        .delete()
        .eq("draft_team_id", draftTeamId);

      if (error) throw error;
    },
    onSuccess: (_, draftTeamId) => {
      queryClient.invalidateQueries({ queryKey: ["draft-player-queue", draftTeamId] });
      toast.success("Queue cleared");
    },
    onError: (error: Error) => {
      toast.error(`Failed to clear queue: ${error.message}`);
    },
  });

  return {
    addToQueue,
    removeFromQueue,
    reorderQueue,
    clearQueue,
  };
};
