import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusChip } from "@/components/family/StatusChip";
import { toast } from "sonner";

type Period = {
  period: string; expected: number; provider: number; offline: number; bank: number | null; refunds: number; disputes: number;
  comps: number; variance: number; closed_at: string | null; changed_since_close: boolean;
};
type Report = { periods: Period[]; programs: { program: string; billed: number; registrations: number }[]; bank_note: string; can_close: boolean };

const $ = (n: number | null | undefined) => (n == null ? "" : `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
const month = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" });

/** Treasurer report: expected vs Stripe vs bank per month. Read only; closing a month only snapshots it. */
const TreasurerReport = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["treasurer-report"],
    queryFn: async () => {
      const { data: d, error: e } = await supabase.rpc("treasurer_report", { _months: 6 });
      if (e) throw e;
      return d as unknown as Report;
    },
  });
  const close = async (p: string) => {
    const { error: e } = await supabase.rpc("close_ledger_period", { _period: p });
    if (e) return toast.error(e.message);
    toast.success(`${month(p)} closed`); refetch();
  };

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6">
        {isLoading ? <Skeleton className="h-64 w-full rounded-xl" /> : error || !data ? (
          <p className="text-[15px]">We couldn't load the report. {(error as Error | null)?.message}</p>
        ) : (
          <>
            <p className="text-[15px] text-muted-foreground">{data.bank_note}</p>
            <ul className="space-y-3" aria-label="Months">
              {data.periods.map((p) => {
                const received = Number(p.provider) + Number(p.offline);
                const ties = Math.abs(Number(p.variance)) < 0.005;
                return (
                  <li key={p.period} className="tex-mesh space-y-3 rounded-xl border border-border bg-card p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-label text-[17px] font-semibold">{month(p.period)}</p>
                      <div className="flex flex-wrap gap-2">
                        {p.closed_at && <StatusChip tone="neutral">Closed</StatusChip>}
                        {p.changed_since_close && <StatusChip tone="destructive">Changed after close</StatusChip>}
                        <StatusChip tone={ties ? "success" : "warning"}>{ties ? "Ties out" : "Doesn't tie"}</StatusChip>
                      </div>
                    </div>
                    <dl className="grid grid-cols-2 gap-3 text-[15px] sm:grid-cols-4">
                      <div><dt className="text-muted-foreground">Expected</dt><dd className="tabular-nums">{$(p.expected)}</dd></div>
                      <div><dt className="text-muted-foreground">Stripe</dt><dd className="tabular-nums">{$(p.provider)}</dd></div>
                      <div><dt className="text-muted-foreground">Check and cash</dt><dd className="tabular-nums">{$(p.offline)}</dd></div>
                      <div><dt className="text-muted-foreground">Bank</dt><dd className="tabular-nums">{p.bank == null ? "Not connected" : $(p.bank)}</dd></div>
                    </dl>
                    <dl className="grid grid-cols-2 gap-3 border-t border-border pt-3 text-sm sm:grid-cols-4">
                      <div><dt className="text-muted-foreground">Variance</dt><dd className="tabular-nums">{$(p.variance)}</dd></div>
                      <div><dt className="text-muted-foreground">Refunds</dt><dd className="tabular-nums">{$(p.refunds)}</dd></div>
                      <div><dt className="text-muted-foreground">Disputes</dt><dd className="tabular-nums">{$(p.disputes)}</dd></div>
                      <div><dt className="text-muted-foreground">Comps</dt><dd className="tabular-nums">{$(p.comps)}</dd></div>
                    </dl>
                    <p className="sr-only">Received {$(received)}</p>
                    {data.can_close && !p.closed_at && (
                      <button type="button" className="inline-flex min-h-[44px] items-center rounded-full border border-border px-4 font-label text-[15px] font-semibold" onClick={() => close(p.period)}>
                        Close {month(p.period).split(" ")[0]}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
            <section className="tex-mesh rounded-xl border border-border bg-card p-4" aria-label="By program">
              <p className="font-label text-[17px] font-semibold">By program</p>
              {data.programs.length === 0 ? <p className="mt-2 text-[15px] text-muted-foreground">No registrations have been billed yet.</p> : (
                <ul className="mt-2 divide-y divide-border">
                  {data.programs.map((x) => (
                    <li key={x.program} className="flex min-h-[44px] items-center justify-between gap-3 text-[15px]">
                      <span className="min-w-0">{x.program}, {x.registrations} {x.registrations === 1 ? "registration" : "registrations"}</span>
                      <span className="tabular-nums">{$(x.billed)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default TreasurerReport;
