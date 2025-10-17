import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useGuardians = (playerId: string | undefined) => {
  return useQuery({
    queryKey: ["guardians", playerId],
    queryFn: async () => {
      if (!playerId) return [];
      const { data, error } = await supabase
        .from("player_guardians")
        .select("*")
        .eq("player_id", playerId)
        .order("is_primary", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!playerId,
  });
};
