import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TeamFilters {
  status?: string;
  division_id?: string;
  program_id?: string;
  season_year?: number;
  search?: string;
}

export const useTeams = (filters?: TeamFilters) => {
  return useQuery({
    queryKey: ["teams", filters],
    queryFn: async () => {
      let query = supabase
        .from("teams")
        .select(`
          *,
          division:divisions(id, name),
          program:programs(id, name, type),
          team_coaches(
            id,
            role,
            primary_contact,
            coach:coaches(id, first_name, last_name, email, phone)
          )
        `)
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.division_id) {
        query = query.eq("division_id", filters.division_id);
      }
      if (filters?.program_id) {
        query = query.eq("program_id", filters.program_id);
      }
      if (filters?.season_year) {
        query = query.eq("season_year", filters.season_year);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,nickname.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useTeam = (id: string | undefined) => {
  return useQuery({
    queryKey: ["team", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("teams")
        .select(`
          *,
          division:divisions(id, name),
          program:programs(id, name, type),
          team_coaches(
            id,
            role,
            primary_contact,
            status,
            coach:coaches(id, first_name, last_name, email, phone, background_check_status)
          ),
          team_rosters(
            id,
            jersey_number,
            position_primary,
            status,
            player:players(id, first_name, last_name, date_of_birth, age_at_registration)
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
