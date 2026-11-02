import { supabase } from "@/integrations/supabase/client";

export type MfaStatus = "not_required" | "ok" | "needs_setup" | "needs_code";

/** Roles that must use two-step sign-in are decided in the database (requires_mfa). */
export async function getMfaStatus(userId: string): Promise<MfaStatus> {
  const { data: required, error } = await supabase.rpc("requires_mfa", { _user_id: userId });
  if (error) throw error;
  if (!required) return "not_required";
  const { data: aal, error: aalErr } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aalErr) throw aalErr;
  if (aal.currentLevel === "aal2") return "ok";
  return aal.nextLevel === "aal2" ? "needs_code" : "needs_setup";
}

export function safeNext(raw: string | null, fallback = "/admin") {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : fallback;
}

/**
 * Make sure the stored sign-in is still live on the server before any two-step call.
 * A cached session whose server session was ended returns
 * "A valid session and a registered user are required" from enroll/verify.
 */
export async function ensureLiveSession(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;
  const { data, error } = await supabase.auth.getUser();
  if (!error && data.user) return true;
  const { data: refreshed, error: rErr } = await supabase.auth.refreshSession();
  if (rErr || !refreshed.session) {
    await supabase.auth.signOut({ scope: "local" });
    return false;
  }
  const again = await supabase.auth.getUser();
  return !again.error && !!again.data.user;
}

/** Supabase returns an unescaped SVG data URL; re-encode so every browser renders it. */
export function qrSrc(raw: string): string {
  const m = /^data:image\/svg\+xml;(?:utf-?8,)?(.*)$/is.exec(raw);
  if (!m || raw.includes(";base64,")) return raw;
  const svg = m[1].trim().startsWith("<") ? m[1] : decodeURIComponent(m[1]);
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

export const MFA_HELP = "Having trouble? Contact the league admin.";
