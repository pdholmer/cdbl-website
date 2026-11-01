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
