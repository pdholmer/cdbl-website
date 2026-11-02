// Shared Stripe helpers for the payments ledger. TEST MODE ONLY until the board approves Stripe.
// The webhook and the nightly sweep both turn Stripe objects into ledger events here and
// send them to the ONE database ingest function, public.ingest_payment_event.

export type LedgerEvent = {
  provider_payment_id: string;
  related_payment_id?: string | null;
  kind: "charge" | "refund" | "dispute" | "dispute_reversal";
  status: "pending" | "succeeded" | "failed";
  method?: string | null;
  amount: number; // dollars, refunds and disputes negative
  currency?: string;
  cart_id?: string | null;
  registration_ids?: string[];
  livemode: boolean;
  occurred_at?: string;
  raw?: Record<string, unknown>;
};

export function stripeKey(): string | null {
  const k = Deno.env.get("STRIPE_SECRET_KEY");
  if (!k) return null;
  // Hard stop on live keys until the board vote.
  if (!k.startsWith("sk_test_") && !k.startsWith("rk_test_")) throw new Error("Only Stripe test keys are allowed");
  return k;
}

export async function stripeGet(path: string, key: string) {
  const r = await fetch(`https://api.stripe.com/v1/${path}`, { headers: { Authorization: `Bearer ${key}` } });
  const j = await r.json();
  if (!r.ok) throw new Error(`Stripe ${r.status}: ${j?.error?.message ?? "error"}`);
  return j;
}

export async function stripePost(path: string, key: string, form: Record<string, string>) {
  const r = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(form).toString(),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`Stripe ${r.status}: ${j?.error?.message ?? "error"}`);
  return j;
}

const enc = new TextEncoder();
function hex(buf: ArrayBuffer) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

/** Verifies a Stripe-Signature header. Unsigned or wrong = false. */
export async function verifyStripeSignature(body: string, header: string | null, secret: string, toleranceSec = 300) {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=", 2)).filter((p) => p.length === 2)) as Record<string, string>;
  const sigs = header.split(",").filter((p) => p.startsWith("v1=")).map((p) => p.slice(3));
  const t = parts.t;
  if (!t || sigs.length === 0) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > toleranceSec) return false;
  const k = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = hex(await crypto.subtle.sign("HMAC", k, enc.encode(`${t}.${body}`)));
  return sigs.some((s) => safeEqual(s, expected));
}

const regIds = (meta: Record<string, string> | undefined) =>
  (meta?.registration_ids ?? "").split(",").map((s) => s.trim()).filter(Boolean);

function methodOf(pi: any): string | null {
  const t = pi?.latest_charge?.payment_method_details?.type ?? pi?.payment_method_types?.[0];
  return t === "card" || t === "us_bank_account" ? t : t ? "other" : null;
}

/** A PaymentIntent (with metadata.cart_id) -> its current ledger state. */
export function paymentIntentEvent(pi: any, statusOverride?: LedgerEvent["status"]): LedgerEvent | null {
  if (!pi?.id || !pi.metadata?.cart_id) return null;
  let status: LedgerEvent["status"] | null = statusOverride ?? null;
  if (!status) {
    if (pi.status === "succeeded") status = "succeeded";
    else if (pi.status === "processing") status = "pending";
    else if (pi.status === "requires_payment_method" && pi.last_payment_error) status = "failed";
    else if (pi.status === "canceled") status = null;
  }
  if (!status) return null;
  return {
    provider_payment_id: pi.id,
    kind: "charge",
    status,
    method: methodOf(pi),
    amount: (pi.amount ?? 0) / 100,
    currency: pi.currency,
    cart_id: pi.metadata.cart_id,
    registration_ids: regIds(pi.metadata),
    livemode: !!pi.livemode,
    occurred_at: new Date((pi.created ?? Date.now() / 1000) * 1000).toISOString(),
    raw: { payment_intent: pi.id, status: pi.status },
  };
}

export function refundEvent(rf: any): LedgerEvent | null {
  if (!rf?.id) return null;
  const status = rf.status === "succeeded" ? "succeeded" : rf.status === "failed" || rf.status === "canceled" ? "failed" : "pending";
  return {
    provider_payment_id: rf.id,
    related_payment_id: typeof rf.payment_intent === "string" ? rf.payment_intent : rf.payment_intent?.id,
    kind: "refund",
    status,
    amount: -(rf.amount ?? 0) / 100,
    currency: rf.currency,
    livemode: !!rf.livemode,
    occurred_at: new Date((rf.created ?? Date.now() / 1000) * 1000).toISOString(),
    raw: { refund: rf.id, status: rf.status },
  };
}

export function disputeEvent(dp: any, closed: boolean): LedgerEvent | null {
  if (!dp?.id) return null;
  const related = typeof dp.payment_intent === "string" ? dp.payment_intent : dp.payment_intent?.id;
  if (closed && dp.status !== "won") return null;
  return {
    provider_payment_id: closed ? `${dp.id}:reversal` : dp.id,
    related_payment_id: related,
    kind: closed ? "dispute_reversal" : "dispute",
    status: "succeeded",
    amount: (closed ? 1 : -1) * (dp.amount ?? 0) / 100,
    currency: dp.currency,
    livemode: !!dp.livemode,
    raw: { dispute: dp.id, status: dp.status },
  };
}

export async function ingest(admin: any, e: LedgerEvent) {
  const { data, error } = await admin.rpc("ingest_payment_event", { _e: e });
  if (error) throw new Error(error.message);
  return data;
}
