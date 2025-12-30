import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Draft {
  id: string;
  name: string;
  division_id: string | null;
  program_id: string | null;
  season_year: number;
  draft_type: string;
  status: string;
  scheduled_start: string | null;
  actual_start: string | null;
  completed_at: string | null;
  pick_time_limit: number;
  auto_pick_enabled: boolean;
  current_round: number;
  current_pick: number;
  total_rounds: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  division?: { name: string } | null;
  program?: { name: string } | null;
}

interface UseDraftsOptions {
  status?: string;
  programId?: string;
  divisionId?: string;
}

export const useDrafts = (options: UseDraftsOptions = {}) => {
  return useQuery({
    queryKey: ["drafts", options],
    queryFn: async () => {
      let query = supabase
        .from("drafts")
        .select(`
          *,
          division:divisions(name),
          program:programs(name)
        `)
        .order("scheduled_start", { ascending: false, nullsFirst: false });

      if (options.status) {
        query = query.eq("status", options.status);
      }
      if (options.programId) {
        query = query.eq("program_id", options.programId);
      }
      if (options.divisionId) {
        query = query.eq("division_id", options.divisionId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Draft[];
    },
  });
};

export const useDraft = (draftId: string | undefined) => {
  return useQuery({
    queryKey: ["draft", draftId],
    queryFn: async () => {
      if (!draftId) return null;

      const { data, error } = await supabase
        .from("drafts")
        .select(`
          *,
          division:divisions(name),
          program:programs(name)
        `)
        .eq("id", draftId)
        .single();

      if (error) throw error;
      return data as Draft;
    },
    enabled: !!draftId,
  });
};
