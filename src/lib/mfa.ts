import { supabase } from "@/integrations/supabase/client";

export type MfaStatus = "not_required" | "ok" | "needs_setup" | "needs_code";

/**
 * Roles that must use two-step sign-in are decided in the database (requires_mfa).
 * Passed when: authenticator code (aal2), or this session passed the email code,
 * or this device is trusted (re-checked by the server each sign-in).
 */
export async function getMfaStatus(userId: string): Promise<MfaStatus> {
  const { data: required, error } = await supabase.rpc("requires_mfa", { _user_id: userId });
  if (error) throw error;
  if (!required) return "not_required";
  const { data: aal, error: aalErr } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aalErr) throw aalErr;
  if (aal.currentLevel === "aal2") return "ok";
  const { data: emailOk, error: eErr } = await supabase.rpc("email_mfa_session_valid");
  if (eErr) throw eErr;
  if (emailOk) return "ok";
  if (await tryTrustedDevice(userId)) return "ok";
  return "needs_code";
}

const deviceKey = (userId: string) => `cdbl-mfa-device:${userId}`;
export const getDeviceToken = (userId: string) => {
  try { return localStorage.getItem(deviceKey(userId)); } catch { return null; }
};
export const saveDeviceToken = (userId: string, token: string) => {
  try { localStorage.setItem(deviceKey(userId), token); } catch { /* storage off */ }
};
export const clearDeviceToken = (userId: string) => {
  try { localStorage.removeItem(deviceKey(userId)); } catch { /* storage off */ }
};

export async function emailCode<T = Record<string, unknown>>(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("mfa-email-code", { body });
  if (error) {
    // Non-2xx: read the JSON body for the rule that stopped it.
    const ctx = (error as { context?: Response }).context;
    let payload: Record<string, unknown> = { error: "network" };
    try { if (ctx) payload = await ctx.json(); } catch { /* keep default */ }
    return { ok: false as const, ...payload } as { ok: false; error?: string } & Record<string, unknown>;
  }
  return data as T & { ok: boolean };
}

async function tryTrustedDevice(userId: string): Promise<boolean> {
  const token = getDeviceToken(userId);
  if (!token) return false;
  const r = await emailCode({ action: "trust_check", deviceToken: token });
  if (r.ok) return true;
  clearDeviceToken(userId);
  return false;
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
