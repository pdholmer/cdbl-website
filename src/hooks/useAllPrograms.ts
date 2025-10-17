import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAllPrograms = () => {
  const query = useQuery({
    queryKey: ['all-programs'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('programs');

      if (error) throw error;
      
      // Don't filter by registration_open - return ALL programs for admin
      const programs = data?.programs || [];
      const inHouseProgram = programs.find((p: any) => p.type === 'in_house');
      const travelProgram = programs.find((p: any) => p.type === 'travel');
      const inHouseDivisions = inHouseProgram?.divisions || [];
      const travelDivisions = travelProgram?.divisions || [];

      return {
        programs,
        inHouseProgram,
        travelProgram,
        inHouseDivisions,
        travelDivisions,
      };
    },
  });

  return {
    ...query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
};
