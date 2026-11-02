import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { StatusChip } from "@/components/family/StatusChip";
import { longDate } from "@/lib/registration";
import { toast } from "sonner";

/** Fee settings (admin, treasurer) and private financial-help requests (admin, board, treasurer). */
export const MoneySetup = ({ seasonId, roles }: { seasonId: string; roles: string[] }) => {
  const canEdit = roles.includes("admin") || roles.includes("treasurer");
  const canHelp = canEdit || roles.includes("board_member");
  const { data, refetch } = useQuery({
    queryKey: ["money-setup", seasonId],
    queryFn: async () => {
      const { data: s } = await supabase.from("season_settings").select("*").eq("season_id", seasonId).maybeSingle();
      const { data: reqs } = canHelp
        ? await supabase.from("assistance_requests").select("id, cart_id, contact_name, contact_phone, status, created_at").eq("status", "open").order("created_at")
        : { data: [] };
      const cartIds = (reqs ?? []).map((r) => r.cart_id);
      const { data: regs } = cartIds.length
        ? await supabase.from("registrations").select("id, checkout_id, players(first_name, last_name)").in("checkout_id", cartIds)
        : { data: [] };
      return { s, reqs: reqs ?? [], regs: (regs ?? []) as { id: string; checkout_id: string; players: { first_name: string; last_name: string } | null }[] };
    },
  });
  const [compFor, setCompFor] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const s = data?.s;
  const update = async (patch: Record<string, unknown>) => {
    const { error } = await supabase.from("season_settings").update(patch).eq("id", s!.id);
    if (error) return toast.error(error.message); refetch();
  };
  const comp = async (regId: string, reqId: string) => {
    const { error } = await supabase.rpc("approve_comp", { _registration_id: regId, _amount: Number(amount), _reason: reason, _assistance_request_id: reqId });
    if (error) return toast.error(error.message);
    toast.success("Comp recorded"); setCompFor(null); setAmount(""); setReason(""); refetch();
  };

  return (
    <>
      {s && (
        <section className="tex-mesh space-y-4 rounded-xl border border-border bg-card p-5" aria-label="Fees and discounts">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-label text-[17px] font-semibold">Fees and discounts</p>
            {s.confirmed_at ? <StatusChip tone="success">Confirmed</StatusChip> : <StatusChip tone="warning">Working value, confirm</StatusChip>}
          </div>
          <dl className="grid gap-3 text-[15px] sm:grid-cols-2">
            <div><dt className="text-muted-foreground">Early bird</dt><dd>${Number(s.early_bird_amount).toFixed(0)} off each registration until {longDate(s.early_bird_ends_on)}</dd></div>
            <div><dt className="text-muted-foreground">Sibling discount</dt><dd>${Number(s.sibling_amount).toFixed(0)} off each additional child</dd></div>
            <div><dt className="text-muted-foreground">Late fee</dt><dd>${Number(s.late_fee_amount).toFixed(0)} after the close date</dd></div>
            <div><dt className="text-muted-foreground">Seat hold</dt><dd>{s.seat_hold_minutes} minutes at checkout</dd></div>
          </dl>
          {canEdit ? (
            <div className="space-y-3 border-t border-border pt-4">
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="space-y-1.5"><Label htmlFor="eb-end">Early bird ends</Label><Input id="eb-end" type="date" className="h-11" defaultValue={s.early_bird_ends_on ?? ""} onBlur={(e) => e.target.value !== s.early_bird_ends_on && update({ early_bird_ends_on: e.target.value })} /></div>
                <div className="space-y-1.5"><Label htmlFor="eb">Early bird $</Label><Input id="eb" type="number" min={0} className="h-11" defaultValue={s.early_bird_amount} onBlur={(e) => Number(e.target.value) !== Number(s.early_bird_amount) && update({ early_bird_amount: Number(e.target.value) })} /></div>
                <div className="space-y-1.5"><Label htmlFor="sib">Sibling $</Label><Input id="sib" type="number" min={0} className="h-11" defaultValue={s.sibling_amount} onBlur={(e) => Number(e.target.value) !== Number(s.sibling_amount) && update({ sibling_amount: Number(e.target.value) })} /></div>
                <div className="space-y-1.5"><Label htmlFor="lf">Late fee $</Label><Input id="lf" type="number" min={0} className="h-11" defaultValue={s.late_fee_amount} onBlur={(e) => Number(e.target.value) !== Number(s.late_fee_amount) && update({ late_fee_amount: Number(e.target.value) })} /></div>
              </div>
              <label className="flex min-h-[44px] items-center gap-3 text-[15px]">
                <Switch checked={s.ihtt_also_pays_in_house} onCheckedChange={(v) => update({ ihtt_also_pays_in_house: v })} />
                IHTT families also pay the In-House fee
              </label>
              {!s.confirmed_at && <Button variant="outline" className="h-11 rounded-full" onClick={() => update({ confirmed_at: new Date().toISOString() })}>Confirm these values</Button>}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">IHTT families also pay In-House: {s.ihtt_also_pays_in_house ? "yes" : "no"}. The treasurer or an admin can change these.</p>
          )}
        </section>
      )}

      {canHelp && (
        <section className="space-y-3" aria-label="Help paying requests">
          <p className="font-label text-[17px] font-semibold">Help paying requests</p>
          <p className="text-sm text-muted-foreground">Private to the board, treasurer and admins. Spots stay held until you decide.</p>
          {data?.reqs.length ? (
            <ul className="space-y-3">
              {data.reqs.map((q) => (
                <li key={q.id} className="tex-mesh rounded-xl border border-border bg-card p-4">
                  <p className="font-label text-[17px] font-semibold">{q.contact_name}</p>
                  <p className="text-[15px]"><a href={`tel:${q.contact_phone}`} className="inline-flex min-h-[44px] items-center underline">{q.contact_phone}</a></p>
                  <ul className="mt-2 space-y-2">
                    {data.regs.filter((r) => r.checkout_id === q.cart_id).map((r) => (
                      <li key={r.id}>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[15px]">{r.players ? `${r.players.first_name} ${r.players.last_name}` : "Player"}</span>
                          <Button variant="outline" className="h-11 rounded-full" onClick={() => setCompFor(compFor === r.id ? null : r.id)}>Waive an amount</Button>
                        </div>
                        {compFor === r.id && (
                          <div className="mt-2 flex flex-wrap items-end gap-2">
                            <div className="space-y-1.5"><Label htmlFor={`a-${r.id}`}>Amount $</Label><Input id={`a-${r.id}`} type="number" min={1} className="h-11 w-28" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
                            <div className="space-y-1.5"><Label htmlFor={`r-${r.id}`}>Reason</Label><Input id={`r-${r.id}`} className="h-11 w-56" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
                            <Button className="h-11 rounded-full" onClick={() => comp(r.id, q.id)}>Record the comp</Button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : <p className="text-[15px] text-muted-foreground">No families are waiting on a decision.</p>}
        </section>
      )}
    </>
  );
};

export default MoneySetup;
