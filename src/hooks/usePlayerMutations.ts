import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type PlayerInsert = Database["public"]["Tables"]["players"]["Insert"];
type PlayerUpdate = Database["public"]["Tables"]["players"]["Update"];

export const usePlayerMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createPlayer = useMutation({
    mutationFn: async (player: PlayerInsert) => {
      const { data, error } = await supabase
        .from("players")
        .insert(player)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      toast({
        title: "Player created",
        description: "Player has been added successfully.",
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

  const updatePlayer = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: PlayerUpdate }) => {
      const { data, error } = await supabase
        .from("players")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["player"] });
      toast({
        title: "Player updated",
        description: "Player information has been updated.",
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

  const deletePlayer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("players").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      toast({
        title: "Player deleted",
        description: "Player has been removed.",
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

  const bulkUpdateStatus = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      const { error } = await supabase
        .from("players")
        .update({ status })
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      toast({
        title: "Status updated",
        description: "Player statuses have been updated.",
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
    createPlayer,
    updatePlayer,
    deletePlayer,
    bulkUpdateStatus,
  };
};
