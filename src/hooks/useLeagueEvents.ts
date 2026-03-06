import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface LeagueEvent {
  id: string;
  title: string;
  event_date: string;
  end_date: string | null;
  event_time: string | null;
  location: string | null;
  event_type: string;
  description: string | null;
  category: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type LeagueEventInsert = Omit<LeagueEvent, "id" | "created_at" | "updated_at">;
export type LeagueEventUpdate = Partial<LeagueEventInsert>;

export const useLeagueEvents = () => {
  return useQuery({
    queryKey: ["league_events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("league_events")
        .select("*")
        .order("event_date", { ascending: true });
      if (error) throw error;
      return data as LeagueEvent[];
    },
  });
};

export const useLeagueEventMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createEvent = useMutation({
    mutationFn: async (event: LeagueEventInsert) => {
      const { data, error } = await supabase
        .from("league_events")
        .insert(event)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["league_events"] });
      toast({ title: "Event created", description: "League event has been added." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: LeagueEventUpdate }) => {
      const { data, error } = await supabase
        .from("league_events")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["league_events"] });
      toast({ title: "Event updated", description: "League event has been updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("league_events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["league_events"] });
      toast({ title: "Event deleted", description: "League event has been removed." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return { createEvent, updateEvent, deleteEvent };
};
