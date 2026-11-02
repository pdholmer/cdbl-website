// Nightly sweep (TEST MODE). Re-reads recent Stripe payments and refunds and sends them
// through the SAME ingest function as the webhook, then runs the seat-hold sweep and
// writes a heartbeat row so a dead sweep is visible to admins.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { ingest, paymentIntentEvent, refundEvent, stripeGet, stripeKey } from "../_shared/stripe-ledger.ts";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "POST only" });
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // At most one run every 10 minutes (it is safe to repeat, but no reason to hammer Stripe).
  const { data: last } = await admin.from("job_heartbeats").select("ran_at").eq("job_key", "stripe_sweep")
    .order("ran_at", { ascending: false }).limit(1);
  if (last?.[0] && Date.now() - new Date(last[0].ran_at).getTime() < 10 * 60 * 1000) {
    return json(200, { skipped: "ran recently" });
  }

  const detail: Record<string, unknown> = {};
  let ok = true;
  try {
    const key = stripeKey();
    if (!key) {
      detail.stripe = "STRIPE_SECRET_KEY not set; payment re-read skipped";
    } else {
      const since = Math.floor(Date.now() / 1000) - 3 * 86400;
      const pis = await stripeGet(`payment_intents?created[gte]=${since}&limit=100&expand[]=data.latest_charge`, key);
      let seen = 0, recorded = 0;
      for (const pi of pis.data ?? []) {
        const e = paymentIntentEvent(pi);
        if (!e) continue;
        seen++;
        const r = await ingest(admin, e);
        if (r?.result !== "duplicate") recorded++;
      }
      const rfs = await stripeGet(`refunds?created[gte]=${since}&limit=100`, key);
      for (const rf of rfs.data ?? []) {
        const e = refundEvent(rf);
        if (!e) continue;
        seen++;
        const r = await ingest(admin, e);
        if (r?.result !== "duplicate") recorded++;
      }
      detail.stripe = { seen, recorded };
    }
    const { data: holds, error: he } = await admin.rpc("expire_stale_holds");
    if (he) throw new Error(he.message);
    detail.holds = holds;
  } catch (err) {
    ok = false;
    detail.error = err instanceof Error ? err.message : String(err);
  }
  await admin.rpc("record_heartbeat", { _job_key: "stripe_sweep", _ok: ok, _detail: detail });
  return json(ok ? 200 : 500, { ok, detail });
});
