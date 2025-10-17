import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSiteContent = (page?: string, section?: string) => {
  return useQuery({
    queryKey: ['site-content', page, section],
    queryFn: async () => {
      let query = supabase
        .from('site_content')
        .select('*')
        .order('display_order');
      
      if (page) {
        query = query.eq('page', page);
      }
      
      if (section) {
        query = query.eq('section', section);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};
