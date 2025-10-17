import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VenueFilters {
  status?: string;
  search?: string;
}

export const useVenues = (filters?: VenueFilters) => {
  return useQuery({
    queryKey: ["venues", filters],
    queryFn: async () => {
      let query = supabase
        .from("venues")
        .select("*")
        .order("name", { ascending: true });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,city.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useVenue = (id: string | undefined) => {
  return useQuery({
    queryKey: ["venue", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("venues")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};
