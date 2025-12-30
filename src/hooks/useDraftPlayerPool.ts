import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DraftPoolPlayer {
  id: string;
  draft_id: string;
  player_id: string;
  is_available: boolean;
  draft_notes: string | null;
  skill_rating: number | null;
  created_at: string;
  player: {
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    age_at_registration: number | null;
    gender: string | null;
    skill_level: string | null;
    previous_experience: boolean | null;
    previous_divisions_played: string | null;
    parent_guardian_name: string;
    parent_phone: string;
    special_requests: string | null;
  };
}

export const useDraftPlayerPool = (draftId: string | undefined) => {
  return useQuery({
    queryKey: ["draft-player-pool", draftId],
    queryFn: async () => {
      if (!draftId) return [];

      const { data, error } = await supabase
        .from("draft_player_pool")
        .select(`
          *,
          player:players(
            id,
            first_name,
            last_name,
            date_of_birth,
            age_at_registration,
            gender,
            skill_level,
            previous_experience,
            previous_divisions_played,
            parent_guardian_name,
            parent_phone,
            special_requests
          )
        `)
        .eq("draft_id", draftId)
        .order("skill_rating", { ascending: false, nullsFirst: false });

      if (error) throw error;
      return data as DraftPoolPlayer[];
    },
    enabled: !!draftId,
  });
};

export const useAvailablePlayers = (draftId: string | undefined) => {
  return useQuery({
    queryKey: ["draft-player-pool", draftId, "available"],
    queryFn: async () => {
      if (!draftId) return [];

      const { data, error } = await supabase
        .from("draft_player_pool")
        .select(`
          *,
          player:players(
            id,
            first_name,
            last_name,
            date_of_birth,
            age_at_registration,
            gender,
            skill_level,
            previous_experience,
            previous_divisions_played,
            parent_guardian_name,
            parent_phone,
            special_requests
          )
        `)
        .eq("draft_id", draftId)
        .eq("is_available", true)
        .order("skill_rating", { ascending: false, nullsFirst: false });

      if (error) throw error;
      return data as DraftPoolPlayer[];
    },
    enabled: !!draftId,
  });
};

interface AddPlayerToPoolData {
  draft_id: string;
  player_id: string;
  skill_rating?: number;
  draft_notes?: string;
}

interface UpdatePoolPlayerData {
  id: string;
  skill_rating?: number;
  draft_notes?: string;
  is_available?: boolean;
}

export const useDraftPlayerPoolMutations = () => {
  const queryClient = useQueryClient();

  const addPlayer = useMutation({
    mutationFn: async (data: AddPlayerToPoolData) => {
      const { data: result, error } = await supabase
        .from("draft_player_pool")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["draft-player-pool", variables.draft_id] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to add player: ${error.message}`);
    },
  });

  const addMultiplePlayers = useMutation({
    mutationFn: async (data: AddPlayerToPoolData[]) => {
      const { data: result, error } = await supabase
        .from("draft_player_pool")
        .insert(data)
        .select();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      if (variables.length > 0) {
        queryClient.invalidateQueries({ queryKey: ["draft-player-pool", variables[0].draft_id] });
      }
      toast.success(`Added ${variables.length} players to draft pool`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to add players: ${error.message}`);
    },
  });

  const updatePlayer = useMutation({
    mutationFn: async ({ id, ...data }: UpdatePoolPlayerData) => {
      const { data: result, error } = await supabase
        .from("draft_player_pool")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["draft-player-pool"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update player: ${error.message}`);
    },
  });

  const removePlayer = useMutation({
    mutationFn: async ({ id, draftId }: { id: string; draftId: string }) => {
      const { error } = await supabase.from("draft_player_pool").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["draft-player-pool", variables.draftId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove player: ${error.message}`);
    },
  });

  return {
    addPlayer,
    addMultiplePlayers,
    updatePlayer,
    removePlayer,
  };
};
