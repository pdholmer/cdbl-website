import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type RosterInsert = Database["public"]["Tables"]["team_rosters"]["Insert"];
type RosterUpdate = Database["public"]["Tables"]["team_rosters"]["Update"];

export const useRosterMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addPlayerToTeam = useMutation({
    mutationFn: async (roster: RosterInsert) => {
      // Add to roster
      const { data: rosterData, error: rosterError } = await supabase
        .from("team_rosters")
        .insert(roster)
        .select()
        .single();
      if (rosterError) throw rosterError;

      // Update player's team_id
      const { error: playerError } = await supabase
        .from("players")
        .update({
          team_id: roster.team_id,
          assigned_date: new Date().toISOString(),
        })
        .eq("id", roster.player_id);
      if (playerError) throw playerError;

      return rosterData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["team"] });
      queryClient.invalidateQueries({ queryKey: ["players"] });
      toast({
        title: "Player added",
        description: "Player has been added to the team.",
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

  const removePlayerFromTeam = useMutation({
    mutationFn: async ({ rosterId, playerId }: { rosterId: string; playerId: string }) => {
      // Update roster status
      const { error: rosterError } = await supabase
        .from("team_rosters")
        .update({ status: "inactive", removed_date: new Date().toISOString() })
        .eq("id", rosterId);
      if (rosterError) throw rosterError;

      // Clear player's team_id
      const { error: playerError } = await supabase
        .from("players")
        .update({ team_id: null })
        .eq("id", playerId);
      if (playerError) throw playerError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["team"] });
      queryClient.invalidateQueries({ queryKey: ["players"] });
      toast({
        title: "Player removed",
        description: "Player has been removed from the team.",
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

  const updateRoster = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: RosterUpdate }) => {
      const { data, error } = await supabase
        .from("team_rosters")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["team"] });
      toast({
        title: "Roster updated",
        description: "Roster information has been updated.",
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
    addPlayerToTeam,
    removePlayerFromTeam,
    updateRoster,
  };
};
