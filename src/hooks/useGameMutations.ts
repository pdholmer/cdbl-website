import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type GameInsert = Database["public"]["Tables"]["games"]["Insert"];
type GameUpdate = Database["public"]["Tables"]["games"]["Update"];

export const useGameMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createGame = useMutation({
    mutationFn: async (game: GameInsert) => {
      const { data, error} = await supabase
        .from("games")
        .insert(game)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      toast({
        title: "Game created",
        description: "Game has been scheduled successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateGame = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: GameUpdate }) => {
      const { data, error } = await supabase
        .from("games")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["game"] });
      toast({
        title: "Game updated",
        description: "Game information has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteGame = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("games").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      toast({
        title: "Game deleted",
        description: "Game has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    createGame,
    updateGame,
    deleteGame,
  };
};
