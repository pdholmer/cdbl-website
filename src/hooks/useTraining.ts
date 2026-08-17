import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TrainingAccess {
  loading: boolean;
  isAuthenticated: boolean;
  canView: boolean;
  canEdit: boolean;
}

/** Resolves whether the signed-in user may see the Situations Trainer. */
export function useTrainingAccess(): TrainingAccess {
  const [state, setState] = useState<TrainingAccess>({
    loading: true,
    isAuthenticated: false,
    canView: false,
    canEdit: false,
  });

  useEffect(() => {
    let active = true;

    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (active) setState({ loading: false, isAuthenticated: false, canView: false, canEdit: false });
        return;
      }
      const [viewer, editor] = await Promise.all([
        supabase.rpc("is_training_viewer", { _user_id: session.user.id }),
        supabase.rpc("is_training_editor", { _user_id: session.user.id }),
      ]);
      if (active) {
        setState({
          loading: false,
          isAuthenticated: true,
          canView: !!viewer.data,
          canEdit: !!editor.data,
        });
      }
    };

    check();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => check());
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}

export interface SituationSummary {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  base_state: string;
  age_band: string;
  difficulty: string;
  category: string;
  sort_order: number;
}

export function usePublishedSituations(enabled: boolean) {
  return useQuery({
    queryKey: ["situations", "published"],
    enabled,
    queryFn: async (): Promise<SituationSummary[]> => {
      const { data, error } = await supabase
        .from("situations")
        .select("id,title,slug,description,base_state,age_band,difficulty,category,sort_order")
        .eq("status", "published")
        .order("sort_order", { ascending: true })
        .order("title", { ascending: true });
      if (error) throw error;
      return (data ?? []) as SituationSummary[];
    },
  });
}

export interface SituationStep {
  id: string;
  step_number: number;
  label: string | null;
  note: string | null;
  positions: Record<string, { x: number; y: number }>;
  runners: { id: string; x: number; y: number }[];
  ball: { x: number; y: number } | null;
}

export interface SituationDetail extends SituationSummary {
  outs: number | null;
  batted_ball: string | null;
  field_zone: string | null;
  status: string;
  steps: SituationStep[];
}

export function useSituationDetail(slug: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["situation", slug],
    enabled: enabled && !!slug,
    queryFn: async (): Promise<SituationDetail | null> => {
      const { data: situation, error } = await supabase
        .from("situations")
        .select(
          "id,title,slug,description,base_state,age_band,difficulty,category,sort_order,outs,batted_ball,field_zone,status"
        )
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      if (!situation) return null;

      const { data: steps, error: stepsError } = await supabase
        .from("situation_steps")
        .select("id,step_number,label,note,positions,runners,ball")
        .eq("situation_id", situation.id)
        .order("step_number", { ascending: true });
      if (stepsError) throw stepsError;

      return {
        ...(situation as unknown as SituationDetail),
        steps: ((steps ?? []) as unknown[]).map((s) => {
          const row = s as Record<string, unknown>;
          return {
            id: String(row.id),
            step_number: Number(row.step_number),
            label: (row.label as string) ?? null,
            note: (row.note as string) ?? null,
            positions: (row.positions ?? {}) as SituationStep["positions"],
            runners: (Array.isArray(row.runners) ? row.runners : []) as SituationStep["runners"],
            ball: (row.ball ?? null) as SituationStep["ball"],
          };
        }),
      };
    },
  });
}
