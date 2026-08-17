import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TeamRosterCount {
  team_id: string;
  active_count: number;
  effective_max: number | null;
  effective_min: number | null;
}

/**
 * Derived roster counts and effective roster bounds per team.
 * Reads public.team_roster_counts (security_invoker view) instead of the
 * stored teams.current_roster_count column.
 *
 * effective_max = teams.max_roster_size override, else divisions.default_max_roster_size.
 */
export const useTeamRosterCounts = () => {
  return useQuery({
    queryKey: ["team-roster-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_roster_counts")
        .select("team_id, active_count, effective_max, effective_min");
      if (error) throw error;

      const map = new Map<string, TeamRosterCount>();
      for (const row of (data ?? []) as any[]) {
        if (!row.team_id) continue;
        map.set(row.team_id, {
          team_id: row.team_id,
          active_count: Number(row.active_count ?? 0),
          effective_max: row.effective_max ?? null,
          effective_min: row.effective_min ?? null,
        });
      }
      return map;
    },
  });
};

/** Renders "3 / 12", or "3 / —" when no division default has been set yet. */
export const formatRosterCount = (count?: TeamRosterCount) =>
  `${count?.active_count ?? 0} / ${count?.effective_max ?? "—"}`;
