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
