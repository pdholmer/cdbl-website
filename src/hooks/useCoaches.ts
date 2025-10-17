import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CoachFilters {
  status?: string;
  background_check_status?: string;
  search?: string;
}

export const useCoaches = (filters?: CoachFilters) => {
  return useQuery({
    queryKey: ["coaches", filters],
    queryFn: async () => {
      let query = supabase
        .from("coaches")
        .select(`
          *,
          team_coaches(
            id,
            role,
            team:teams(id, name, division:divisions(name))
          )
        `)
        .order("last_name", { ascending: true });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.background_check_status) {
        query = query.eq("background_check_status", filters.background_check_status);
      }
      if (filters?.search) {
        query = query.or(
          `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useCoach = (id: string | undefined) => {
  return useQuery({
    queryKey: ["coach", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("coaches")
        .select(`
          *,
          team_coaches(
            id,
            role,
            primary_contact,
            status,
            assigned_date,
            team:teams(id, name, season_year, division:divisions(name))
          )
        `)
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};
