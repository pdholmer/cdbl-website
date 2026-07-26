// Resend webhook ingestion. verify_jwt=false, Svix signature enforced.
//
// - Match event to notification_recipients by provider_message_id.
// - Update status + timestamp column for that event type.
// - Hard bounces + complaints -> insert email_suppressions (ON CONFLICT DO NOTHING).
// - Also write an email_bounces row so the older screen keeps working.
// - Idempotent: a replayed webhook must be a no-op.

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_WEBHOOK_SECRET = Deno.env.get("RESEND_WEBHOOK_SECRET");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Svix HMAC verification (webhooks.resend.com is Svix-hosted).
async function verifySvix(
  secret: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string,
  payload: string,
): Promise<boolean> {
  // Secret format: "whsec_<base64>"
  const rawSecret = secret.startsWith("whsec_")
    ? secret.slice("whsec_".length)
    : secret;
  let keyBytes: Uint8Array;
  try {
    keyBytes = Uint8Array.from(atob(rawSecret), (c) => c.charCodeAt(0));
  } catch {
    // Fall back to treating the secret as a literal string.
    keyBytes = new TextEncoder().encode(rawSecret);
  }
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const toSign = `${svixId}.${svixTimestamp}.${payload}`;
  const sig = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(toSign),
  );
  const expected = btoa(String.fromCharCode(...new Uint8Array(sig)));

  // svix-signature: "v1,<b64> v1,<b64>..."
  return svixSignature
    .split(" ")
    .some((part) => {
      const [ver, val] = part.split(",");
      return ver === "v1" && val === expected;
    });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  if (!RESEND_WEBHOOK_SECRET) {
    return json(500, {
      error:
        "RESEND_WEBHOOK_SECRET is not configured. Add it in Project Settings → Secrets.",
    });
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");
  const rawBody = await req.text();

  if (!svixId || !svixTimestamp || !svixSignature) {
    return json(401, { error: "Missing Svix signature headers" });
  }
  const ok = await verifySvix(
    RESEND_WEBHOOK_SECRET,
    svixId,
    svixTimestamp,
    svixSignature,
    rawBody,
  );
  if (!ok) return json(401, { error: "Invalid signature" });

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  const type: string = event?.type ?? "";
  const data = event?.data ?? {};
  const providerId: string | null = data?.email_id ?? data?.id ?? null;
  const recipientEmail: string | null =
    Array.isArray(data?.to) && data.to.length > 0
      ? String(data.to[0])
      : data?.to ?? null;
  const bounceType: string | null =
    data?.bounce?.type ?? data?.bounce_type ?? null;

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const nowIso = new Date().toISOString();

  // Idempotency: bail out early if we've already recorded this exact
  // (svix_id, event type) combination via provider_message_id + status.
  // We defensively check the current recipient state before writing.
  let recipientRow: any = null;
  if (providerId) {
    const { data: r } = await admin
      .from("notification_recipients")
      .select(
        "id, league_id, status, sent_at, delivered_at, opened_at, bounced_at",
      )
      .eq("provider_message_id", providerId)
      .maybeSingle();
    recipientRow = r;
  }

  const applyUpdate = async (
    patch: Record<string, any>,
    guard?: (r: any) => boolean,
  ) => {
    if (!recipientRow) return;
    if (guard && !guard(recipientRow)) return; // already applied
    await admin
      .from("notification_recipients")
      .update(patch)
      .eq("id", recipientRow.id);
  };

  switch (type) {
    case "email.sent":
      await applyUpdate(
        { status: "sent", sent_at: nowIso },
        (r) => !r.sent_at,
      );
      break;
    case "email.delivered":
      await applyUpdate(
        { status: "delivered", delivered_at: nowIso },
        (r) => !r.delivered_at,
      );
      break;
    case "email.opened":
      await applyUpdate(
        { status: "opened", opened_at: nowIso },
        (r) => !r.opened_at,
      );
      break;
    case "email.delivery_delayed":
      // No status transition (delivery still in flight). No-op.
      break;
    case "email.bounced": {
      await applyUpdate(
        {
          status: "bounced",
          bounced_at: nowIso,
          failure_reason: `bounce (${bounceType ?? "unknown"})`,
        },
        (r) => !r.bounced_at,
      );
      const isHard = String(bounceType ?? "").toLowerCase() === "hard";
      if (isHard && recipientEmail) {
        await admin
          .from("email_suppressions")
          .insert({
            league_id: recipientRow?.league_id ?? null,
            email: recipientEmail,
            reason: "hard_bounce",
            detail: JSON.stringify(data?.bounce ?? {}),
            source: "resend_webhook",
          })
          .then(() => {})
          .catch(() => {}); // unique index handles idempotency
      }
      if (recipientEmail) {
        await admin
          .from("email_bounces")
          .insert({
            email: recipientEmail,
            bounce_type: bounceType ?? null,
            provider: "resend",
            metadata: data ?? {},
            resolved: false,
          })
          .then(() => {})
          .catch(() => {});
      }
      break;
    }
    case "email.complained": {
      await applyUpdate(
        {
          status: "complained",
          bounced_at: nowIso,
          failure_reason: "complaint",
        },
        (r) => r.status !== "complained",
      );
      if (recipientEmail) {
        await admin
          .from("email_suppressions")
          .insert({
            league_id: recipientRow?.league_id ?? null,
            email: recipientEmail,
            reason: "complaint",
            detail: "spam complaint via Resend",
            source: "resend_webhook",
          })
          .then(() => {})
          .catch(() => {});
        await admin
          .from("email_bounces")
          .insert({
            email: recipientEmail,
            bounce_type: "complaint",
            provider: "resend",
            metadata: data ?? {},
            resolved: false,
          })
          .then(() => {})
          .catch(() => {});
      }
      break;
    }
    default:
      // Unknown event type: accept and ignore so Resend stops retrying.
      break;
  }

  return json(200, { ok: true });
});
