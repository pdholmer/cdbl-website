import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusChip } from "@/components/family/StatusChip";
import { longDate } from "@/lib/registration";
import { toast } from "sonner";

type Expectation = { id: string; cart_id: string; kind: string; due_on: string; amount: number; reference_code: string; households: { name: string } | null };
type CallTask = { id: string; created_at: string; body: string; household_name: string | null; contact: string | null; done: boolean };

const pill = "inline-flex min-h-[44px] items-center rounded-full border border-border px-4 font-label text-[15px] font-semibold";

/** Registrar desk: nightly sweep health, call tasks, offline payments received, manual payment plans. Read-only money views; every write is a database function. */
export const PaymentsDesk = () => {
  const { data, refetch } = useQuery({
    queryKey: ["payments-desk"],
    queryFn: async () => {
      const [{ data: beat }, { data: exp }, { data: tasks }] = await Promise.all([
        supabase.from("job_heartbeats").select("ran_at, ok, detail").eq("job_key", "stripe_sweep").order("ran_at", { ascending: false }).limit(1),
        supabase.from("payment_expectations").select("id, cart_id, kind, due_on, amount, reference_code, households(name)").is("cancelled_at", null).order("due_on"),
        supabase.rpc("list_call_tasks"),
      ]);
      return { beat: beat?.[0] ?? null, exp: (exp ?? []) as unknown as Expectation[], tasks: (tasks ?? []) as CallTask[] };
    },
  });
  const [recv, setRecv] = useState<{ cart: string; amount: string; method: "check" | "cash" } | null>(null);
  const [plan, setPlan] = useState<{ cart: string; rows: { due_on: string; amount: string }[] } | null>(null);

  const stale = !data?.beat || Date.now() - new Date(data.beat.ran_at).getTime() > 36 * 3600 * 1000 || !data.beat.ok;
  const openTasks = (data?.tasks ?? []).filter((t) => !t.done);

  const markReceived = async () => {
    if (!recv) return;
    const { error } = await supabase.rpc("record_offline_payment", { _cart_id: recv.cart, _amount: Number(recv.amount), _method: recv.method, _note: "Marked received by registrar" });
    if (error) return toast.error(error.message);
    toast.success("Payment recorded"); setRecv(null); refetch();
  };
  const savePlan = async () => {
    if (!plan) return;
    const { error } = await supabase.rpc("set_payment_plan", { _cart_id: plan.cart, _schedule: plan.rows.map((r) => ({ due_on: r.due_on, amount: Number(r.amount) })) });
    if (error) return toast.error(error.message);
    toast.success("Plan saved"); setPlan(null); refetch();
  };
  const done = async (id: string) => {
    const { error } = await supabase.rpc("complete_call_task", { _id: id });
    if (error) return toast.error(error.message);
    refetch();
  };

  return (
    <section className="tex-mesh space-y-5 rounded-xl border border-border bg-card p-5" aria-label="Payments">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-label text-[17px] font-semibold">Payments</p>
        <StatusChip tone="warning">Stripe test mode</StatusChip>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-[15px]">
        <span>Nightly payment check {data?.beat ? `last ran ${new Date(data.beat.ran_at).toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" })}` : "has not run yet"}</span>
        {stale ? <StatusChip tone="destructive">Not running</StatusChip> : <StatusChip tone="success">Running</StatusChip>}
      </div>

      <div className="space-y-2 border-t border-border pt-4">
        <p className="font-label text-[16px] font-semibold">Families to call ({openTasks.length})</p>
        {openTasks.length === 0 ? <p className="text-[15px] text-muted-foreground">No families need a call right now.</p> : (
          <ul className="space-y-2">
            {openTasks.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3 text-[15px]">
                <span className="min-w-0">{t.household_name ?? "Family"}, {t.contact}. {t.body}</span>
                <button type="button" className={pill} onClick={() => done(t.id)}>Mark called</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2 border-t border-border pt-4">
        <p className="font-label text-[16px] font-semibold">Waiting on check, cash or a plan</p>
        {(data?.exp ?? []).length === 0 ? <p className="text-[15px] text-muted-foreground">No offline payments are expected.</p> : (
          <ul className="space-y-2">
            {data!.exp.map((e) => (
              <li key={e.id} className="space-y-3 rounded-lg border border-border p-3 text-[15px]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="min-w-0">{e.households?.name ?? "Family"}, {e.reference_code}, ${Number(e.amount).toFixed(2)} due {longDate(e.due_on)}</span>
                  <StatusChip tone="neutral">{e.kind === "plan" ? "Plan" : "Check or cash"}</StatusChip>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={pill} onClick={() => setRecv({ cart: e.cart_id, amount: String(e.amount), method: "check" })}>Mark received</button>
                  <button type="button" className={pill} onClick={() => setPlan({ cart: e.cart_id, rows: [{ due_on: e.due_on, amount: "" }, { due_on: "", amount: "" }] })}>Split into a plan</button>
                </div>
                {recv?.cart === e.cart_id && (
                  <div className="flex flex-wrap items-end gap-2">
                    <div className="space-y-1.5"><Label htmlFor={`amt-${e.id}`}>Amount</Label><Input id={`amt-${e.id}`} inputMode="decimal" className="h-11 w-32" value={recv.amount} onChange={(ev) => setRecv({ ...recv, amount: ev.target.value })} /></div>
                    <div className="space-y-1.5"><Label htmlFor={`m-${e.id}`}>Method</Label>
                      <select id={`m-${e.id}`} className="h-11 rounded-lg border border-border bg-background px-3" value={recv.method} onChange={(ev) => setRecv({ ...recv, method: ev.target.value as "check" | "cash" })}>
                        <option value="check">Check</option><option value="cash">Cash</option>
                      </select></div>
                    <button type="button" className="h-11 rounded-full bg-primary px-5 font-label font-semibold text-primary-foreground" onClick={markReceived}>Record payment</button>
                  </div>
                )}
                {plan?.cart === e.cart_id && (
                  <div className="space-y-2">
                    {plan.rows.map((r, i) => (
                      <div key={i} className="flex flex-wrap gap-2">
                        <Input type="date" aria-label={`Payment ${i + 1} date`} className="h-11 w-44" value={r.due_on} onChange={(ev) => setPlan({ ...plan, rows: plan.rows.map((x, j) => j === i ? { ...x, due_on: ev.target.value } : x) })} />
                        <Input inputMode="decimal" aria-label={`Payment ${i + 1} amount`} placeholder="Amount" className="h-11 w-32" value={r.amount} onChange={(ev) => setPlan({ ...plan, rows: plan.rows.map((x, j) => j === i ? { ...x, amount: ev.target.value } : x) })} />
                      </div>
                    ))}
                    <div className="flex flex-wrap gap-2">
                      {plan.rows.length < 3 && <button type="button" className={pill} onClick={() => setPlan({ ...plan, rows: [...plan.rows, { due_on: "", amount: "" }] })}>Add a payment</button>}
                      <button type="button" className="h-11 rounded-full bg-primary px-5 font-label font-semibold text-primary-foreground" onClick={savePlan}>Save plan</button>
                    </div>
                    <p className="text-sm text-muted-foreground">Payments must add up to the balance. Nothing is charged automatically.</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default PaymentsDesk;
