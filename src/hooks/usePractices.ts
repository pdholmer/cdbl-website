import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePractices = () => {
  return useQuery({
    queryKey: ["practices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("practices")
        .select(`
          *,
          team:teams!practices_team_id_fkey(id, name, division:divisions(name)),
          venue:venues!practices_venue_id_fkey(id, name, address, city)
        `)
        .order("practice_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};
