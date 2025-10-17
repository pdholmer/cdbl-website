import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePrograms = (programType?: 'in_house' | 'travel') => {
  return useQuery({
    queryKey: ['programs', programType],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('programs', {
        body: programType ? { type: programType } : {}
      });

      if (error) throw error;
      return data.programs;
    },
  });
};
