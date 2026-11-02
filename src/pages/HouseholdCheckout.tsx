import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/shell/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StatusChip } from "@/components/family";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Line = { registration_id: string; type: string; label: string; amount: number };
type CartResult = { lines: Line[]; total: number; locked: boolean; status: string; lock_expires_at?: string | null; closed?: boolean };

const money = (n: number) => `${n < 0 ? "-" : ""}$${Math.abs(Number(n)).toFixed(0)}`;

/** The family's checkout. Every number comes from the cart_lines function; the browser never prices anything. */
const HouseholdCheckout = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["my-cart"],
    queryFn: async () => {
      const { data: carts, error: ce } = await supabase.from("carts").select("id, status, created_at")
        .in("status", ["open", "locked", "on_hold"]).order("created_at", { ascending: false }).limit(1);
      if (ce) throw ce;
      const cart = carts?.[0];
      if (!cart) return null;
      const { data: res, error: re } = await supabase.rpc("cart_lines", { _cart_id: cart.id });
      if (re) throw re;
      return { cartId: cart.id, result: res as unknown as CartResult };
    },
  });

  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [hName, setHName] = useState("");
  const [hPhone, setHPhone] = useState("");
  const [hErr, setHErr] = useState<string | null>(null);

  const r = data?.result;
  const lock = async () => {
    if (!data) return;
    setBusy(true); setErr(null);
    const { error: e } = await supabase.rpc("lock_my_cart", { _cart_id: data.cartId });
    setBusy(false);
    if (e) return setErr(e.message);
    toast.success("Price locked and spots held");
    refetch();
  };
  const applyCode = async () => {
    if (!data || !code.trim()) return;
    const { error: e } = await supabase.rpc("apply_cart_code", { _cart_id: data.cartId, _code: code });
    if (e) return setErr(e.message);
    setCode(""); setErr(null); refetch();
  };
  const askHelp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setHErr(null);
    const { error: he } = await supabase.rpc("request_payment_help", { _cart_id: data.cartId, _name: hName, _phone: hPhone });
    if (he) return setHErr(he.message);
    setHelpOpen(false);
    toast.success("Thanks. A board member will call you, and your spots are held.");
    refetch();
  };

  const byReg = new Map<string, Line[]>();
  r?.lines.forEach((l) => byReg.set(l.registration_id, [...(byReg.get(l.registration_id) ?? []), l]));
  const held = r?.status === "on_hold";
  const until = r?.lock_expires_at ? new Date(r.lock_expires_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : null;

  return (
    <AppShell area="family" label="2027 season, checkout" title={r ? `${money(r.total)} total` : "Checkout"}>
      <div className="mx-auto w-full max-w-2xl px-4 py-8 pb-40 sm:px-6">
        {isLoading ? <Skeleton className="h-64 w-full rounded-2xl" /> : error ? (
          <p className="text-[15px]">We couldn't load your checkout. <button className="min-h-[44px] underline" onClick={() => refetch()}>Try again</button></p>
        ) : !data || !r ? (
          <p className="text-[15px]">Nothing in checkout yet. <Link to="/household" className="inline-flex min-h-[44px] items-center underline">Pick a program for a player</Link> first.</p>
        ) : (
          <div className="space-y-6">
            {held && <StatusChip tone="neutral">On hold while the board reviews your request</StatusChip>}
            {r.locked && !held && until && <StatusChip tone="warning">Price locked until {until}</StatusChip>}
            <ul className="space-y-3">
              {[...byReg.entries()].map(([id, lines]) => (
                <li key={id} className="tex-mesh rounded-xl border border-border bg-card p-4">
                  {lines.map((l, i) => (
                    <div key={i} className={cn("flex items-baseline justify-between gap-3 py-1", i === 0 ? "font-label text-[17px] font-semibold" : "text-[15px] text-muted-foreground")}>
                      <span className="min-w-0">{l.label}</span>
                      <span className="shrink-0 tabular-nums">{money(l.amount)}</span>
                    </div>
                  ))}
                </li>
              ))}
            </ul>
            <div className="flex items-baseline justify-between border-t border-border pt-4">
              <span className="font-label text-[17px] font-semibold">Total</span>
              <span className="font-display text-3xl font-bold tabular-nums">{money(r.total)}</span>
            </div>
            <p className="text-sm text-muted-foreground">The price shown is the price you pay. The league covers card and bank fees.</p>
            {!held && (
              <button type="button" onClick={() => setHelpOpen(true)} className="inline-flex min-h-[44px] items-center text-[15px] underline underline-offset-4">
                Cost shouldn't keep any kid off the field
              </button>
            )}
            {!r.locked && !held && (
              <div className="flex flex-wrap items-end gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="code">Discount code</Label>
                  <Input id="code" className="h-11 w-48" value={code} onChange={(e) => setCode(e.target.value)} />
                </div>
                <button type="button" onClick={applyCode} className="h-11 rounded-full border border-border px-5 font-label text-[15px] font-semibold">Apply</button>
              </div>
            )}
            {r.closed && <p className="text-[15px]">Registration is closed for this season.</p>}
            {err && <p role="alert" className="text-sm font-semibold text-destructive">{err}</p>}
          </div>
        )}
      </div>

      {data && r && !held && (
        <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:bottom-0">
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            <button type="button" onClick={lock} disabled={busy || r.locked || r.closed}
              className="h-12 flex-1 rounded-full bg-primary px-5 font-label text-[16px] font-semibold text-primary-foreground disabled:opacity-50">
              {r.locked ? "Payment opens in the next step" : busy ? "Locking" : `Hold spots at ${money(r.total)}`}
            </button>
          </div>
        </div>
      )}

      <Sheet open={helpOpen} onOpenChange={setHelpOpen}>
        <SheetContent side="bottom" className="sm:mx-auto sm:max-w-xl sm:rounded-t-2xl">
          <SheetHeader className="text-left">
            <SheetTitle className="font-display text-2xl">Ask about help paying</SheetTitle>
            <SheetDescription>Only the board and treasurer see this. Your spots stay held while they decide.</SheetDescription>
          </SheetHeader>
          <form onSubmit={askHelp} className="mt-4 space-y-4 pb-4">
            <div className="space-y-1.5"><Label htmlFor="h-name">Your name</Label><Input id="h-name" className="h-11" value={hName} onChange={(e) => setHName(e.target.value)} required autoComplete="name" /></div>
            <div className="space-y-1.5"><Label htmlFor="h-phone">Phone</Label><Input id="h-phone" type="tel" inputMode="tel" className="h-11" value={hPhone} onChange={(e) => setHPhone(e.target.value)} required autoComplete="tel" /></div>
            {hErr && <p role="alert" className="text-sm font-semibold text-destructive">{hErr}</p>}
            <button type="submit" className="h-12 w-full rounded-full bg-primary font-label text-base font-semibold text-primary-foreground">Send to the board</button>
          </form>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
};

export default HouseholdCheckout;
