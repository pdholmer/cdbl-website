// Creates a Stripe Checkout Session (TEST MODE ONLY) for a family's locked cart.
// The amount comes from the server-side price lock (checkout_session_input), never the browser.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { stripeKey, stripePost } from "../_shared/stripe-ledger.ts";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const Body = z.object({ action: z.literal("create"), cart_id: z.string().uuid(), return_origin: z.string().url() });
const ALLOWED = [/^https:\/\/(www\.)?cdbaseball\.org$/, /^https:\/\/[a-z0-9-]+\.lovable\.app$/, /^https:\/\/[a-z0-9-]+\.lovableproject\.com$/, /^http:\/\/localhost:\d+$/];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "POST only" });

  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return json(401, { error: "Sign in first" });
  const raw = await req.json().catch(() => ({}));

  // Readiness check for the league office: reports only whether keys are set, never their values.
  if (raw?.action === "readiness") {
    const url = Deno.env.get("SUPABASE_URL")!;
    const uc = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: claims } = await uc.auth.getClaims(auth.slice(7));
    const uid = claims?.claims?.sub;
    if (!uid) return json(401, { error: "Sign in first" });
    const { data: ok } = await uc.rpc("has_any_role", { _user_id: uid, _roles: ["admin", "board_member", "registrar", "treasurer"] });
    if (!ok) return json(403, { error: "not allowed" });
    const sk = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
    return json(200, {
      stripe_key_set: sk.startsWith("sk_test_"),
      stripe_key_is_live: sk.startsWith("sk_live_"),
      webhook_secret_set: !!Deno.env.get("STRIPE_WEBHOOK_SECRET"),
      resend_key_set: !!Deno.env.get("RESEND_API_KEY"),
    });
  }

  const parsed = Body.safeParse(raw);
  if (!parsed.success) return json(400, { error: parsed.error.flatten().fieldErrors });
  const { cart_id, return_origin } = parsed.data;
  const origin = new URL(return_origin).origin;
  if (!ALLOWED.some((re) => re.test(origin))) return json(400, { error: "Unknown site" });

  const url = Deno.env.get("SUPABASE_URL")!;
  const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
  const { data: claims, error: ce } = await userClient.auth.getClaims(auth.slice(7));
  if (ce || !claims?.claims?.sub) return json(401, { error: "Sign in first" });

  let key: string | null;
  try { key = stripeKey(); } catch (e) { return json(503, { error: (e as Error).message }); }
  if (!key) return json(503, { error: "Online payment isn't switched on yet. Pay by check or cash, or try again later." });

  // Guardian check, lock check and amount all come from the database.
  const { data: input, error: ie } = await userClient.rpc("checkout_session_input", { _cart_id: cart_id });
  if (ie) return json(ie.code === "42501" ? 403 : 400, { error: ie.message });
  const amountCents = Math.round(Number(input.amount) * 100);
  if (!(amountCents >= 50)) return json(400, { error: "Nothing to pay online" });
  const regs: string[] = input.registration_ids ?? [];
  const regMeta = regs.join(",").slice(0, 500);

  // Session expiry: the stated hold time, capped to Stripe's 24-hour limit (minimum 31 minutes).
  const now = Math.floor(Date.now() / 1000);
  const hold = Math.floor(new Date(input.hold_until).getTime() / 1000);
  const expiresAt = Math.max(now + 31 * 60, Math.min(hold, now + 23 * 3600));

  const form: Record<string, string> = {
    mode: "payment",
    "payment_method_types[0]": "us_bank_account",
    "payment_method_types[1]": "card",
    "payment_method_options[us_bank_account][verification_method]": "automatic",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(amountCents),
    "line_items[0][price_data][product_data][name]": "CDBL 2027 registration",
    "metadata[cart_id]": cart_id,
    "metadata[registration_ids]": regMeta,
    "payment_intent_data[metadata][cart_id]": cart_id,
    "payment_intent_data[metadata][registration_ids]": regMeta,
    success_url: `${origin}/household/checkout?paid=1`,
    cancel_url: `${origin}/household/checkout`,
    expires_at: String(expiresAt),
    client_reference_id: cart_id,
  };
  if (input.email) form.customer_email = input.email;

  try {
    const session = await stripePost("checkout/sessions", key, form);
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    await admin.rpc("set_cart_stripe_session", { _cart_id: cart_id, _session_id: session.id });
    return json(200, { url: session.url });
  } catch (e) {
    console.error("stripe-checkout", e);
    return json(502, { error: "We couldn't start the payment page. Please try again." });
  }
});
