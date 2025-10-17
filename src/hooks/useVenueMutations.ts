import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type VenueInsert = Database["public"]["Tables"]["venues"]["Insert"];
type VenueUpdate = Database["public"]["Tables"]["venues"]["Update"];

export const useVenueMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createVenue = useMutation({
    mutationFn: async (venue: VenueInsert) => {
      const { data, error } = await supabase
        .from("venues")
        .insert(venue)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      toast({
        title: "Venue created",
        description: "Venue has been added successfully.",
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

  const updateVenue = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: VenueUpdate }) => {
      const { data, error } = await supabase
        .from("venues")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      queryClient.invalidateQueries({ queryKey: ["venue"] });
      toast({
        title: "Venue updated",
        description: "Venue information has been updated.",
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

  const deleteVenue = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("venues").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      toast({
        title: "Venue deleted",
        description: "Venue has been removed.",
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
    createVenue,
    updateVenue,
    deleteVenue,
  };
};
