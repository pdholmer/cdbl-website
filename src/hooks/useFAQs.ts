import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFAQs = (programId?: string) => {
  const query = useQuery({
    queryKey: ['faqs', programId],
    queryFn: async () => {
      let queryBuilder = supabase.from('faqs').select('*').order('display_order');
      
      if (programId) {
        queryBuilder = queryBuilder.eq('program_id', programId);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;
      return data;
    },
  });

  return {
    faqs: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
};
