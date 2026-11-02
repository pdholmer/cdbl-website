import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusChip } from "@/components/family/StatusChip";
import type { ChipTone } from "@/components/family/StatusChip";
import { owedSummary, toCsv, type RegRow } from "@/lib/registrationsList";

const payTone = (p: string): ChipTone => (p === "paid" || p === "waived" ? "success" : p === "partial" ? "warning" : p === "unpaid" ? "destructive" : "neutral");
const words = (s: string | null) => (s ? s.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase()) : "None");
const pill = "inline-flex min-h-[44px] items-center rounded-full border border-border px-4 font-label text-[15px] font-semibold";
const select = "h-11 rounded-lg border border-border bg-background px-3 text-[15px]";

const download = (name: string, csv: string) => {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
};

/** Registrations list. Commissioners get their divisions only, without household names or amounts (enforced by list_registrations). */
const RegistrationsList = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["list-registrations"],
    queryFn: async () => {
      const { data: rows, error: e } = await supabase.rpc("list_registrations");
      if (e) throw e;
      return (rows ?? []) as RegRow[];
    },
  });
  const [q, setQ] = useState("");
  const [division, setDivision] = useState("");
  const [payment, setPayment] = useState("");
  const [forms, setForms] = useState("");
  const [seat, setSeat] = useState("");

  const rows = data ?? [];
  const divisions = useMemo(() => [...new Set(rows.map((r) => r.division_name).filter(Boolean))].sort() as string[], [rows]);
  const shown = rows.filter((r) =>
    (!q || r.player_name.toLowerCase().includes(q.toLowerCase())) &&
    (!division || r.division_name === division) && (!payment || r.payment === payment) && (!seat || r.seat === seat) &&
    (!forms || (forms === "signed" ? r.forms_signed >= r.forms_required : r.forms_signed < r.forms_required)));
  const seesMoney = rows.some((r) => r.amount_due !== null || r.household_name !== null);
  const owed = owedSummary(shown);

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-6 sm:px-6">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <Input aria-label="Search players" placeholder="Search players" className="h-11" value={q} onChange={(e) => setQ(e.target.value)} />
          <select aria-label="Division" className={select} value={division} onChange={(e) => setDivision(e.target.value)}>
            <option value="">All divisions</option>{divisions.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select aria-label="Payment" className={select} value={payment} onChange={(e) => setPayment(e.target.value)}>
            <option value="">Any payment</option><option value="paid">Paid</option><option value="partial">Partial</option><option value="unpaid">Unpaid</option><option value="waived">Waived</option>
          </select>
          <select aria-label="Forms" className={select} value={forms} onChange={(e) => setForms(e.target.value)}>
            <option value="">Any forms</option><option value="signed">Forms signed</option><option value="pending">Forms pending</option>
          </select>
          <select aria-label="Spot" className={select} value={seat} onChange={(e) => setSeat(e.target.value)}>
            <option value="">Any spot</option><option value="confirmed">Confirmed</option><option value="held">Saved</option><option value="waitlisted">Waitlisted</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={pill} onClick={() => download("registrations.csv", toCsv(shown, seesMoney, false))}>Export list</button>
          <button type="button" className={pill} onClick={() => download("draft-day.csv", toCsv(shown, seesMoney, true))}>Export for draft day</button>
          <span className="text-[15px] text-muted-foreground">
            {shown.length} {shown.length === 1 ? "registration" : "registrations"}
            {seesMoney && owed.families > 0 && `. ${owed.families} ${owed.families === 1 ? "family owes" : "families owe"} $${owed.total.toFixed(2)}`}
            {!seesMoney && owed.players > 0 && `. ${owed.players} still unpaid`}
          </span>
        </div>

        {isLoading ? <Skeleton className="h-64 w-full rounded-xl" /> : error ? (
          <p className="text-[15px]">We couldn't load registrations. {(error as Error).message}</p>
        ) : shown.length === 0 ? (
          <p className="text-[15px] text-muted-foreground">No registrations match these filters.</p>
        ) : (
          <ul className="tex-mesh divide-y divide-border rounded-xl border border-border bg-card" aria-label="Registrations">
            {shown.map((r) => (
              <li key={r.registration_id} className="grid gap-2 px-4 py-3 md:grid-cols-[1.4fr_1fr_auto] md:items-center">
                <div className="min-w-0">
                  <p className="font-label text-[16px] font-semibold">{r.player_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {[r.program_name, r.division_name, r.household_name].filter(Boolean).join(", ")}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {words(r.lifecycle)}, forms {r.forms_signed} of {r.forms_required}
                  {r.hold_reason ? `, hold: ${words(r.hold_reason).toLowerCase()}` : ""}
                  {r.amount_due != null && Number(r.amount_due) > 0 ? `, $${Number(r.amount_due).toFixed(2)} due` : ""}
                </p>
                <div className="flex flex-wrap gap-2">
                  <StatusChip tone={r.seat === "confirmed" ? "success" : "neutral"}>{r.seat === "held" ? "Saved" : words(r.seat)}</StatusChip>
                  <StatusChip tone={payTone(r.payment)}>{words(r.payment)}</StatusChip>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminLayout>
  );
};

export default RegistrationsList;
