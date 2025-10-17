import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type CoachInsert = Database["public"]["Tables"]["coaches"]["Insert"];
type CoachUpdate = Database["public"]["Tables"]["coaches"]["Update"];

export const useCoachMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createCoach = useMutation({
    mutationFn: async (coach: CoachInsert) => {
      const { data, error } = await supabase
        .from("coaches")
        .insert(coach)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      toast({
        title: "Coach created",
        description: "Coach has been added successfully.",
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

  const updateCoach = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: CoachUpdate }) => {
      const { data, error } = await supabase
        .from("coaches")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      queryClient.invalidateQueries({ queryKey: ["coach"] });
      toast({
        title: "Coach updated",
        description: "Coach information has been updated.",
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

  const deleteCoach = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coaches").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      toast({
        title: "Coach deleted",
        description: "Coach has been removed.",
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

  const assignCoachToTeam = useMutation({
    mutationFn: async ({
      team_id,
      coach_id,
      role,
      primary_contact = false,
    }: {
      team_id: string;
      coach_id: string;
      role: string;
      primary_contact?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("team_coaches")
        .insert({ team_id, coach_id, role, primary_contact })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["team"] });
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      toast({
        title: "Coach assigned",
        description: "Coach has been assigned to the team.",
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

  const removeCoachFromTeam = useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from("team_coaches")
        .delete()
        .eq("id", assignmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["team"] });
      toast({
        title: "Coach removed",
        description: "Coach has been removed from the team.",
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
    createCoach,
    updateCoach,
    deleteCoach,
    assignCoachToTeam,
    removeCoachFromTeam,
  };
};
