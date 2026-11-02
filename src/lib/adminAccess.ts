import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Which admin sections each staff role may open. The database policies are the
 * real enforcement; this only decides what the sidebar shows and when to render
 * the "No access" page.
 */
export const FULL_ACCESS_ROLES = ["admin", "board_member"] as const;
export const LIMITED_STAFF_ROLES = ["commissioner", "registrar", "treasurer", "background_checks"] as const;
export const ADMIN_PANEL_ROLES = [...FULL_ACCESS_ROLES, ...LIMITED_STAFF_ROLES] as const;

/** Section path prefix -> limited roles allowed in it (admin/board always allowed). */
export const SECTION_ROLES: Record<string, readonly string[]> = {
  "/admin/players": ["registrar"],
  "/admin/teams": ["commissioner"],
  "/admin/coaches": ["commissioner", "background_checks"],
  "/admin/schedule": ["commissioner"],
  "/admin/drafts": ["commissioner"],
  "/admin/commissioner": ["commissioner"],
  "/admin/divisions": ["commissioner", "registrar", "treasurer"],
  "/admin/programs": ["registrar"],
  "/admin/registration-codes": ["treasurer"],
};

/** Routes that today require the admin role specifically (board_member excluded). */
const ADMIN_ONLY_PREFIXES = [
  "/admin/reports", "/admin/gamechanger", "/admin/programs", "/admin/divisions", "/admin/drafts",
  "/admin/commissioner", "/admin/registration-codes", "/admin/committee-tasks", "/admin/concessions",
];

const matchPrefix = (path: string, prefix: string) => path === prefix || path.startsWith(prefix + "/");

export const isStaff = (roles: string[]) => roles.some((r) => (ADMIN_PANEL_ROLES as readonly string[]).includes(r));

/** Can a user holding `roles` open `path` in the admin panel? */
export const canAccessAdminPath = (roles: string[], path: string): boolean => {
  if (roles.includes("admin")) return true;
  if (path === "/admin") return isStaff(roles);
  const adminOnly = ADMIN_ONLY_PREFIXES.some((p) => matchPrefix(path, p));
  if (roles.includes("board_member") && !adminOnly) return true;
  const entry = Object.entries(SECTION_ROLES).find(([p]) => matchPrefix(path, p));
  return !!entry && roles.some((r) => entry[1].includes(r));
};

/** Can these roles do full edits (not only the role's narrow write path)? */
export const hasFullAccess = (roles: string[]) => roles.some((r) => (FULL_ACCESS_ROLES as readonly string[]).includes(r));

export const fetchMyRoles = async (uid: string): Promise<string[]> => {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", uid);
  if (error) throw error;
  return (data ?? []).map((r) => r.role as string);
};

export const useMyRoles = () => {
  const [roles, setRoles] = useState<string[] | null>(null);
  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return alive && setRoles([]);
      try { const r = await fetchMyRoles(session.user.id); if (alive) setRoles(r); } catch { if (alive) setRoles([]); }
    });
    return () => { alive = false; };
  }, []);
  return roles;
};
