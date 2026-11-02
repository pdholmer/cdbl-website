import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusChip } from "@/components/family/StatusChip";
import type { ChipTone } from "@/components/family/StatusChip";
import { toast } from "sonner";

type Item = { item_key: string; kind: string; title: string; detail: string; due_at: string | null; ref_id: string; amount: number | null };

const KIND: Record<string, { chip: string; tone: ChipTone; order: number }> = {
  call: { chip: "Failed payment", tone: "destructive", order: 0 },
  placement: { chip: "Placement", tone: "warning", order: 1 },
  offline: { chip: "Check or cash", tone: "warning", order: 2 },
  phone: { chip: "Phone only", tone: "warning", order: 3 },
  waiver: { chip: "Forms", tone: "neutral", order: 4 },
  hold: { chip: "On hold", tone: "neutral", order: 5 },
};
const pill = "inline-flex min-h-[44px] items-center rounded-full border border-border px-4 font-label text-[15px] font-semibold";
const daysLeft = (iso: string | null) => (iso ? Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)) : null);

/** Registrar worklist: one list of things a person must do, each with a done action. */
const Worklist = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["registrar-worklist"],
    queryFn: async () => {
      const [{ data: items, error: e }, { data: cov }] = await Promise.all([
        supabase.rpc("registrar_worklist"),
        supabase.rpc("coverage_mode_on"),
      ]);
      if (e) throw e;
      return { items: ((items ?? []) as Item[]).sort((a, b) => (KIND[a.kind]?.order ?? 9) - (KIND[b.kind]?.order ?? 9)), coverage: !!cov };
    },
  });
  const [recv, setRecv] = useState<{ cart: string; amount: string; method: "check" | "cash" } | null>(null);

  const run = async (p: PromiseLike<{ error: { message: string } | null }>, ok: string) => {
    const { error: e } = await p;
    if (e) return toast.error(e.message);
    toast.success(ok); setRecv(null); refetch();
  };
  const setCoverage = (on: boolean) => run(supabase.rpc("set_coverage_mode", { _on: on }), on ? "Coverage mode is on" : "Coverage mode is off");

  const action = (i: Item) => {
    if (i.kind === "placement") return <Link to="/admin/registration-setup#reviews" className={pill}>Open review</Link>;
    if (i.kind === "call") return <button type="button" className={pill} onClick={() => run(supabase.rpc("complete_call_task", { _id: i.ref_id }), "Marked called")}>Mark called</button>;
    if (i.kind === "offline") return <button type="button" className={pill} onClick={() => setRecv({ cart: i.ref_id, amount: String(i.amount ?? ""), method: "check" })}>Mark received</button>;
    return <button type="button" className={pill} onClick={() => run(supabase.rpc("mark_worklist_done", { _item_key: i.item_key }), "Done")}>Done</button>;
  };

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6">
        {data?.coverage && (
          <div className="card-alert rounded-xl p-5" role="status">
            <p className="font-label text-[17px] font-semibold">Coverage mode is on</p>
            <p className="mt-1 text-[15px]">No saved spot will expire anywhere in the league until it is turned off.</p>
          </div>
        )}
        <label className="tex-mesh flex min-h-[56px] items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3 text-[15px]">
          <span className="min-w-0">
            <span className="block font-label text-[16px] font-semibold">Coverage mode</span>
            <span className="block text-muted-foreground">Turn on while the registrar is away. Saved spots stop expiring.</span>
          </span>
          <Switch checked={!!data?.coverage} onCheckedChange={setCoverage} aria-label="Coverage mode" />
        </label>

        {isLoading ? <Skeleton className="h-64 w-full rounded-xl" /> : error ? (
          <p className="text-[15px]">We couldn't load the worklist. {(error as Error).message}</p>
        ) : data!.items.length === 0 ? (
          <p className="text-[15px] text-muted-foreground">Nothing needs a person right now.</p>
        ) : (
          <ul className="space-y-3" aria-label="Things to do">
            {data!.items.map((i) => {
              const k = KIND[i.kind] ?? { chip: i.kind, tone: "neutral" as ChipTone };
              const left = i.kind === "offline" ? daysLeft(i.due_at) : null;
              return (
                <li key={i.item_key} className="tex-mesh space-y-3 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-label text-[16px] font-semibold">{i.title}</p>
                      <p className="mt-0.5 break-words text-sm text-muted-foreground">
                        {i.detail}
                        {left !== null && `, ${left} ${left === 1 ? "day" : "days"} left of 21`}
                        {i.amount != null && i.kind === "offline" && `, $${Number(i.amount).toFixed(2)} due`}
                      </p>
                    </div>
                    <StatusChip tone={k.tone}>{k.chip}</StatusChip>
                  </div>
                  <div className="flex flex-wrap gap-2">{action(i)}</div>
                  {recv?.cart === i.ref_id && i.kind === "offline" && (
                    <div className="flex flex-wrap items-end gap-2">
                      <label className="space-y-1.5 text-sm"><span className="block">Amount</span>
                        <input inputMode="decimal" className="h-11 w-32 rounded-lg border border-border bg-background px-3" value={recv.amount} onChange={(e) => setRecv({ ...recv, amount: e.target.value })} /></label>
                      <label className="space-y-1.5 text-sm"><span className="block">Method</span>
                        <select className="h-11 rounded-lg border border-border bg-background px-3" value={recv.method} onChange={(e) => setRecv({ ...recv, method: e.target.value as "check" | "cash" })}>
                          <option value="check">Check</option><option value="cash">Cash</option>
                        </select></label>
                      <button type="button" className="h-11 rounded-full bg-primary px-5 font-label font-semibold text-primary-foreground"
                        onClick={() => run(supabase.rpc("record_offline_payment", { _cart_id: recv.cart, _amount: Number(recv.amount), _method: recv.method, _note: "Marked received from worklist" }), "Payment recorded")}>
                        Record payment
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AdminLayout>
  );
};

export default Worklist;
