import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { SituationStep } from "@/hooks/useTraining";

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  situation_id: string;
  position_key: string | null;
  prompt: string;
  options: QuizOption[];
  correct_option: string;
  explanation: string | null;
  why_wrong: Record<string, string>;
  sort_order: number;
  situation?: {
    id: string;
    title: string;
    slug: string;
    base_state: string;
    outs: number | null;
  };
}

const toQuestion = (row: Record<string, unknown>): QuizQuestion => {
  const rawSituation = row.situations as Record<string, unknown> | null | undefined;
  return {
    id: String(row.id),
    situation_id: String(row.situation_id),
    position_key: (row.position_key as string) ?? null,
    prompt: String(row.prompt),
    options: (Array.isArray(row.options) ? row.options : []) as QuizOption[],
    correct_option: String(row.correct_option),
    explanation: (row.explanation as string) ?? null,
    why_wrong: (row.why_wrong ?? {}) as Record<string, string>,
    sort_order: Number(row.sort_order ?? 0),
    situation: rawSituation
      ? {
          id: String(rawSituation.id),
          title: String(rawSituation.title),
          slug: String(rawSituation.slug),
          base_state: String(rawSituation.base_state),
          outs: (rawSituation.outs as number) ?? null,
        }
      : undefined,
  };
};

const QUESTION_FIELDS =
  "id,situation_id,position_key,prompt,options,correct_option,explanation,why_wrong,sort_order";

/** All position questions for one situation. */
export function useSituationQuestions(situationId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["quiz-questions", situationId],
    enabled: enabled && !!situationId,
    queryFn: async (): Promise<QuizQuestion[]> => {
      const { data, error } = await supabase
        .from("situation_quiz_questions")
        .select(QUESTION_FIELDS)
        .eq("situation_id", situationId!)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return ((data ?? []) as Record<string, unknown>[]).map(toQuestion);
    },
  });
}

/** Every question across published situations — the practice-mode pool. */
export function usePracticePool(enabled: boolean) {
  return useQuery({
    queryKey: ["quiz-pool"],
    enabled,
    queryFn: async (): Promise<QuizQuestion[]> => {
      const { data, error } = await supabase
        .from("situation_quiz_questions")
        .select(`${QUESTION_FIELDS},situations!inner(id,title,slug,base_state,outs,status)`)
        .eq("situations.status", "published");
      if (error) throw error;
      return ((data ?? []) as Record<string, unknown>[]).map(toQuestion);
    },
  });
}

/** First keyframe for each situation, used for the practice-mode mini field. */
export function useFirstFrames(situationIds: string[], enabled: boolean) {
  const key = [...situationIds].sort().join(",");
  return useQuery({
    queryKey: ["quiz-first-frames", key],
    enabled: enabled && situationIds.length > 0,
    queryFn: async (): Promise<Record<string, SituationStep>> => {
      const { data, error } = await supabase
        .from("situation_steps")
        .select("id,situation_id,step_number,label,note,positions,runners,ball")
        .in("situation_id", situationIds)
        .eq("step_number", 1);
      if (error) throw error;
      const map: Record<string, SituationStep> = {};
      for (const raw of (data ?? []) as Record<string, unknown>[]) {
        map[String(raw.situation_id)] = {
          id: String(raw.id),
          step_number: Number(raw.step_number),
          label: (raw.label as string) ?? null,
          note: (raw.note as string) ?? null,
          positions: (raw.positions ?? {}) as SituationStep["positions"],
          runners: (Array.isArray(raw.runners) ? raw.runners : []) as SituationStep["runners"],
          ball: (raw.ball ?? null) as SituationStep["ball"],
        };
      }
      return map;
    },
  });
}

export function useCurrentUserId() {
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setUserId(data.session?.user.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user.id ?? null);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);
  return userId;
}

/** Records one answer. Failures are non-fatal for the player's session. */
export function useRecordAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { questionId: string; selectedOption: string; isCorrect: boolean }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { error } = await supabase.from("situation_quiz_attempts").insert({
        user_id: session.user.id,
        question_id: input.questionId,
        selected_option: input.selectedOption,
        is_correct: input.isCorrect,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-progress"] });
      queryClient.invalidateQueries({ queryKey: ["quiz-team-progress"] });
      queryClient.invalidateQueries({ queryKey: ["quiz-situation-attempts"] });
    },
  });
}

export interface ProgressStats {
  total: number;
  correct: number;
  byPosition: { position: string; total: number; correct: number }[];
}

export function useMyProgress(enabled: boolean) {
  return useQuery({
    queryKey: ["quiz-progress"],
    enabled,
    queryFn: async (): Promise<ProgressStats> => {
      const { data, error } = await supabase
        .from("situation_quiz_attempts")
        .select("is_correct,situation_quiz_questions(position_key)")
        .order("answered_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      const rows = (data ?? []) as Record<string, unknown>[];
      const buckets = new Map<string, { total: number; correct: number }>();
      let correct = 0;
      for (const row of rows) {
        const ok = !!row.is_correct;
        if (ok) correct += 1;
        const q = row.situation_quiz_questions as Record<string, unknown> | null;
        const pos = (q?.position_key as string) ?? "—";
        const bucket = buckets.get(pos) ?? { total: 0, correct: 0 };
        bucket.total += 1;
        if (ok) bucket.correct += 1;
        buckets.set(pos, bucket);
      }
      return {
        total: rows.length,
        correct,
        byPosition: [...buckets.entries()]
          .map(([position, v]) => ({ position, ...v }))
          .sort((a, b) => b.total - a.total),
      };
    },
  });
}

/** Which positions the signed-in user has already answered for one situation. */
export function useSituationAttempts(situationId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["quiz-situation-attempts", situationId],
    enabled: enabled && !!situationId,
    queryFn: async (): Promise<Record<string, boolean>> => {
      const { data, error } = await supabase
        .from("situation_quiz_attempts")
        .select("is_correct,answered_at,situation_quiz_questions!inner(position_key,situation_id)")
        .eq("situation_quiz_questions.situation_id", situationId!)
        .order("answered_at", { ascending: true });
      if (error) throw error;
      const map: Record<string, boolean> = {};
      for (const row of (data ?? []) as Record<string, unknown>[]) {
        const q = row.situation_quiz_questions as Record<string, unknown> | null;
        const pos = q?.position_key as string | undefined;
        if (pos) map[pos] = !!row.is_correct;
      }
      return map;
    },
  });
}

export interface TeamProgressRow {
  userId: string;
  name: string;
  total: number;
  correct: number;
}

/** Coach view: per-player totals. Names resolve only where profiles are readable. */
export function useTeamProgress(enabled: boolean) {
  return useQuery({
    queryKey: ["quiz-team-progress"],
    enabled,
    queryFn: async (): Promise<TeamProgressRow[]> => {
      const { data, error } = await supabase
        .from("situation_quiz_attempts")
        .select("user_id,is_correct")
        .limit(5000);
      if (error) throw error;
      const rows = (data ?? []) as { user_id: string; is_correct: boolean }[];
      const buckets = new Map<string, { total: number; correct: number }>();
      for (const r of rows) {
        const b = buckets.get(r.user_id) ?? { total: 0, correct: 0 };
        b.total += 1;
        if (r.is_correct) b.correct += 1;
        buckets.set(r.user_id, b);
      }
      const ids = [...buckets.keys()];
      const names = new Map<string, string>();
      if (ids.length) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id,display_name,email")
          .in("id", ids);
        for (const p of (profiles ?? []) as { id: string; display_name: string | null; email: string }[]) {
          names.set(p.id, p.display_name || p.email);
        }
      }
      return ids
        .map((id) => ({
          userId: id,
          name: names.get(id) ?? `Player ${id.slice(0, 4).toUpperCase()}`,
          total: buckets.get(id)!.total,
          correct: buckets.get(id)!.correct,
        }))
        .sort((a, b) => b.total - a.total);
    },
  });
}

/** Fisher–Yates, seeded by Math.random — session picks are one-off. */
export function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
