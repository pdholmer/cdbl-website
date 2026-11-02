// Stripe webhook (TEST MODE). Unsigned or wrongly signed requests are rejected.
// Every accepted event goes through the same ingest function as the nightly sweep,
// so a redelivered event changes nothing.
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  disputeEvent, ingest, paymentIntentEvent, refundEvent, stripeGet, stripeKey, verifyStripeSignature,
  type LedgerEvent,
} from "../_shared/stripe-ledger.ts";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const body = await req.text();
  if (!secret) return json(400, { error: "Webhook not configured" });
  if (!(await verifyStripeSignature(body, req.headers.get("stripe-signature"), secret))) {
    return json(400, { error: "Invalid signature" });
  }

  let evt: any;
  try { evt = JSON.parse(body); } catch { return json(400, { error: "Bad JSON" }); }
  if (evt.livemode) return json(400, { error: "Live mode is not enabled" });

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const key = stripeKey();
  const obj = evt.data?.object ?? {};
  const events: LedgerEvent[] = [];

  const fullPi = async (id: string) =>
    key ? await stripeGet(`payment_intents/${id}?expand[]=latest_charge`, key) : null;

  try {
    switch (evt.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
      case "checkout.session.async_payment_failed": {
        const piId = typeof obj.payment_intent === "string" ? obj.payment_intent : obj.payment_intent?.id;
        if (!piId) break;
        const pi = (await fullPi(piId)) ?? { id: piId, amount: obj.amount_total, currency: obj.currency, metadata: obj.metadata, livemode: obj.livemode, created: obj.created };
        const status = evt.type === "checkout.session.async_payment_failed" ? "failed"
          : evt.type === "checkout.session.async_payment_succeeded" ? "succeeded"
          : obj.payment_status === "paid" ? "succeeded" : "pending";
        const e = paymentIntentEvent({ ...pi, metadata: { ...(obj.metadata ?? {}), ...(pi.metadata ?? {}) } }, status);
        if (e) events.push(e);
        break;
      }
      case "payment_intent.processing":
      case "payment_intent.succeeded":
      case "payment_intent.payment_failed": {
        const pi = (await fullPi(obj.id)) ?? obj;
        const status = evt.type === "payment_intent.processing" ? "pending" : evt.type === "payment_intent.succeeded" ? "succeeded" : "failed";
        const e = paymentIntentEvent(pi, status);
        if (e) events.push(e);
        break;
      }
      case "charge.refunded":
      case "charge.refund.updated":
      case "refund.created":
      case "refund.updated": {
        if (obj.object === "refund") { const e = refundEvent(obj); if (e) events.push(e); break; }
        const refunds = obj.refunds?.data ?? (key ? (await stripeGet(`refunds?charge=${obj.id}&limit=100`, key)).data : []);
        for (const rf of refunds) { const e = refundEvent(rf); if (e) events.push(e); }
        break;
      }
      case "charge.dispute.created":
      case "charge.dispute.closed": {
        const e = disputeEvent(obj, evt.type === "charge.dispute.closed");
        if (e) events.push(e);
        break;
      }
      default:
        return json(200, { ignored: evt.type });
    }
    const results = [];
    for (const e of events) results.push(await ingest(admin, e));
    return json(200, { received: evt.type, results });
  } catch (err) {
    console.error("stripe-webhook", err);
    // 500 makes Stripe redeliver; ingest is idempotent.
    return json(500, { error: "Could not record event" });
  }
});
