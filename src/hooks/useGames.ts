import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GameFilters {
  status?: string;
  division_id?: string;
  team_id?: string;
  venue_id?: string;
  start_date?: string;
  end_date?: string;
}

export const useGames = (filters?: GameFilters) => {
  return useQuery({
    queryKey: ["games", filters],
    queryFn: async () => {
      let query = supabase
        .from("games")
        .select(`
          *,
          home_team:teams!games_home_team_id_fkey(id, name, division:divisions(name)),
          away_team:teams!games_away_team_id_fkey(id, name, division:divisions(name)),
          venue:venues(id, name, address, city),
          division:divisions(id, name)
        `)
        .order("game_date", { ascending: true })
        .order("game_time", { ascending: true });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.division_id) {
        query = query.eq("division_id", filters.division_id);
      }
      if (filters?.team_id) {
        query = query.or(`home_team_id.eq.${filters.team_id},away_team_id.eq.${filters.team_id}`);
      }
      if (filters?.venue_id) {
        query = query.eq("venue_id", filters.venue_id);
      }
      if (filters?.start_date) {
        query = query.gte("game_date", filters.start_date);
      }
      if (filters?.end_date) {
        query = query.lte("game_date", filters.end_date);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useGame = (id: string | undefined) => {
  return useQuery({
    queryKey: ["game", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("games")
        .select(`
          *,
          home_team:teams!games_home_team_id_fkey(id, name, nickname, division:divisions(name)),
          away_team:teams!games_away_team_id_fkey(id, name, nickname, division:divisions(name)),
          venue:venues(id, name, address, city, has_lights),
          division:divisions(id, name)
        `)
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};
