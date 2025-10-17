import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSupportOptions = (type?: 'donation' | 'sponsorship' | 'volunteer' | 'merchandise') => {
  return useQuery({
    queryKey: ['support-options', type],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('support', {
        body: type ? { type } : {}
      });

      if (error) throw error;
      return data.options;
    },
  });
};
