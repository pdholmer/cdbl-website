import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useGuardianMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createGuardian = useMutation({
    mutationFn: async (data: {
      player_id: string;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      relationship?: string;
      is_primary?: boolean;
    }) => {
      const { data: result, error } = await supabase
        .from("player_guardians")
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["guardians", variables.player_id] });
      toast({
        title: "Success",
        description: "Guardian added successfully",
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

  const updateGuardian = useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string;
      player_id?: string;
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string;
      relationship?: string;
      is_primary?: boolean;
    }) => {
      const { data: result, error } = await supabase
        .from("player_guardians")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["guardians", data.player_id] });
      toast({
        title: "Success",
        description: "Guardian updated successfully",
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

  const deleteGuardian = useMutation({
    mutationFn: async ({ id, player_id }: { id: string; player_id: string }) => {
      const { error } = await supabase
        .from("player_guardians")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { player_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["guardians", data.player_id] });
      toast({
        title: "Success",
        description: "Guardian removed successfully",
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
    createGuardian,
    updateGuardian,
    deleteGuardian,
  };
};
