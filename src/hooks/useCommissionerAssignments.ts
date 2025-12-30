import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CommissionerAssignment {
  id: string;
  user_id: string;
  program_id: string;
  division_id: string | null;
  assigned_by: string | null;
  created_at: string;
  program?: {
    id: string;
    name: string;
    type: string;
  };
  division?: {
    id: string;
    name: string;
  } | null;
}

export function useCommissionerAssignments() {
  return useQuery({
    queryKey: ["commissioner-assignments"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("commissioner_assignments")
        .select(`
          *,
          program:programs(id, name, type),
          division:divisions(id, name)
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      return data as CommissionerAssignment[];
    },
  });
}

export function useAllCommissionerAssignments() {
  return useQuery({
    queryKey: ["all-commissioner-assignments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commissioner_assignments")
        .select(`
          *,
          program:programs(id, name, type),
          division:divisions(id, name)
        `);

      if (error) throw error;
      return data as CommissionerAssignment[];
    },
  });
}
