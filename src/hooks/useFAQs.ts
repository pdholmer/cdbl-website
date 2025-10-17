import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFAQs = (programId?: string) => {
  return useQuery({
    queryKey: ['faqs', programId],
    queryFn: async () => {
      let query = supabase.from('faqs').select('*').order('display_order');
      
      if (programId) {
        query = query.eq('program_id', programId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};
