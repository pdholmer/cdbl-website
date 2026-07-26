import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUnreadContactCount(pollMs = 60_000) {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { count: n } = await supabase
        .from("contact_messages")
        .select("id", { count: "exact", head: true })
        .is("read_at", null);
      if (!cancelled) setCount(n ?? 0);
    };
    load();
    const t = setInterval(load, pollMs);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [pollMs]);

  return count;
}
