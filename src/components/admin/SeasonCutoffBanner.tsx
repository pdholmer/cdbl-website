import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/** Warns admins while an upcoming season has no age cutoff date (registration stays blocked). */
export const SeasonCutoffBanner = () => {
  const { data } = useQuery({
    queryKey: ["season-cutoff-missing"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("seasons")
        .select("id, year, label")
        .is("age_cutoff_date", null)
        .gte("starts_on", today)
        .order("starts_on");
      if (error) {
        console.error("Season cutoff check failed", error);
        return [];
      }
      return data ?? [];
    },
  });

  if (!data || data.length === 0) return null;
  return (
    <div role="status" className="mb-6 flex gap-3 rounded-2xl border border-destructive/40 bg-destructive/5 p-4">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
      <p className="text-sm">
        {data.map((s) => s.label ?? s.year).join(", ")} {data.length > 1 ? "have" : "has"} no age cutoff date.
        Registration can't open until it's set.
      </p>
    </div>
  );
};

export default SeasonCutoffBanner;
