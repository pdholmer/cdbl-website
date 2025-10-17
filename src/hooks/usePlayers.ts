import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PlayerFilters {
  status?: string;
  payment_status?: string;
  division_id?: string;
  program_id?: string;
  search?: string;
}

export const usePlayers = (filters?: PlayerFilters) => {
  return useQuery({
    queryKey: ["players", filters],
    queryFn: async () => {
      let query = supabase
        .from("players")
        .select(`
          *,
          division:divisions(id, name),
          program:programs(id, name, type)
        `)
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.payment_status) {
        query = query.eq("payment_status", filters.payment_status);
      }
      if (filters?.division_id) {
        query = query.eq("division_id", filters.division_id);
      }
      if (filters?.program_id) {
        query = query.eq("program_id", filters.program_id);
      }
      if (filters?.search) {
        query = query.or(
          `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,parent_email.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const usePlayer = (id: string | undefined) => {
  return useQuery({
    queryKey: ["player", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("players")
        .select(`
          *,
          division:divisions(id, name),
          program:programs(id, name, type),
          registration_submissions(*)
        `)
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};
