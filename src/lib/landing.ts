import { supabase } from "@/integrations/supabase/client";

/** Roles the /admin guard admits today (ProtectedRoute requireBoardMember). */
export const ADMIN_PANEL_ROLES = ["admin", "board_member"] as const;

export type Landing = "/admin" | "/coach" | "/household";

/** Pure decision: where a signed-in user lands. */
export const pickLanding = (roles: string[], isTeamCoach: boolean): Landing => {
  if (roles.some((r) => (ADMIN_PANEL_ROLES as readonly string[]).includes(r))) return "/admin";
  if (roles.includes("coach") || isTeamCoach) return "/coach";
  return "/household";
};

/** Reads the caller's own roles and coach link. Throws on read failure. */
export const resolveLanding = async (uid: string): Promise<Landing> => {
  const [rolesRes, coachRes] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", uid),
    supabase.from("coaches").select("id").eq("user_id", uid).limit(1),
  ]);
  if (rolesRes.error) throw rolesRes.error;
  const roles = (rolesRes.data ?? []).map((r) => r.role as string);
  // A coach-record read failure must not block an admin; treat as "not a coach".
  const isTeamCoach = !coachRes.error && (coachRes.data?.length ?? 0) > 0;
  return pickLanding(roles, isTeamCoach);
};

/** Does the caller have a guardian record (for the "My household" link)? */
export const hasGuardianRecord = async (uid: string): Promise<boolean> => {
  const { data, error } = await supabase.from("guardians").select("id").eq("auth_user_id", uid).limit(1);
  return !error && (data?.length ?? 0) > 0;
};
