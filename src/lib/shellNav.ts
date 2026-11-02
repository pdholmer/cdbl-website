// Signed-in shell navigation: tab sets per role and the grouped admin sidebar.
// Visibility is filtered by canAccessAdminPath; database policies remain the real enforcement.
import {
  Home, CalendarDays, Users, MessageSquare, UserRound, ClipboardList, BookOpen, MoreHorizontal, UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { canAccessAdminPath } from "@/lib/adminAccess";

export type ShellArea = "admin" | "coach" | "family";
export interface NavLinkItem { label: string; to: string; icon?: LucideIcon; more?: boolean }
export interface NavGroup { label: string; items: NavLinkItem[] }

export const ADMIN_GROUPS: NavGroup[] = [
  { label: "Run the season", items: [
    { label: "Worklist", to: "/admin/worklist" },
    { label: "Registrations", to: "/admin/registrations" },
    { label: "Players", to: "/admin/players" },
    { label: "Registration setup", to: "/admin/registration-setup" },
    { label: "Teams and coaches", to: "/admin/teams" },
    { label: "Coaches", to: "/admin/coaches" },
    { label: "Draft", to: "/admin/drafts" },
  ] },
  { label: "Game days", items: [
    { label: "Schedule", to: "/admin/schedule" },
    { label: "Facilities", to: "/admin/facilities" },
    { label: "Concessions", to: "/admin/concessions" },
    { label: "GameChanger import", to: "/admin/gamechanger" },
  ] },
  { label: "Talk to families", items: [
    { label: "Messages", to: "/admin/communication" },
    { label: "Help requests", to: "/admin/requests" },
    { label: "Email problems", to: "/admin/email-bounces" },
  ] },
  { label: "League setup", items: [
    { label: "Seasons and programs", to: "/admin/programs" },
    { label: "Divisions", to: "/admin/divisions" },
    { label: "Fees and codes", to: "/admin/registration-codes" },
    { label: "Site pages", to: "/admin/site-content" },
    { label: "FAQs", to: "/admin/faqs" },
    { label: "Sponsors and donations", to: "/admin/support" },
  ] },
  { label: "Board", items: [
    { label: "Committee tasks", to: "/admin/committee-tasks" },
    { label: "Treasurer report", to: "/admin/treasurer" },
    { label: "Reports", to: "/admin/reports" },
    { label: "Feedback", to: "/admin/feedback" },
    { label: "People and roles", to: "/admin/users" },
  ] },
];

export const adminGroupsFor = (roles: string[]): NavGroup[] =>
  ADMIN_GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => canAccessAdminPath(roles, i.to.split("?")[0])) }))
    .filter((g) => g.items.length > 0);

export const tabsFor = (area: ShellArea, roles: string[]): NavLinkItem[] => {
  if (area === "family") return [
    { label: "Home", to: "/household", icon: Home },
    { label: "Schedule", to: "/household#upcoming", icon: CalendarDays },
    { label: "Players", to: "/household#family", icon: Users },
    { label: "Messages", to: "/household#team", icon: MessageSquare },
    { label: "Account", to: "/account", icon: UserRound },
  ];
  if (area === "coach") return [
    { label: "Home", to: "/coach", icon: Home },
    { label: "My Team", to: "/coach#team", icon: UsersRound },
    { label: "Schedule", to: "/schedule", icon: CalendarDays },
    { label: "Training", to: "/training", icon: BookOpen },
    { label: "More", to: "", icon: MoreHorizontal, more: true },
  ];
  const ok = (p: string) => canAccessAdminPath(roles, p.split("?")[0]);
  const reg = ok("/admin/registrations") ? "/admin/registrations" : "/admin/players";
  const candidates: NavLinkItem[] = [
    { label: "Registrations", to: reg, icon: ClipboardList },
    { label: "Teams", to: "/admin/teams", icon: UsersRound },
    { label: "Schedule", to: "/admin/schedule", icon: CalendarDays },
    { label: "Players", to: "/admin/players", icon: Users },
    { label: "Coaches", to: "/admin/coaches", icon: Users },
  ];
  const picked: NavLinkItem[] = [];
  for (const c of candidates) {
    if (picked.length === 3) break;
    if (ok(c.to) && !picked.some((p) => p.to === c.to)) picked.push(c);
  }
  return [{ label: "Home", to: "/admin", icon: Home }, ...picked, { label: "More", to: "", icon: MoreHorizontal, more: true }];
};

/** Which group label owns a path (used as the admin page headline). */
export const adminGroupLabel = (path: string): string => {
  for (const g of ADMIN_GROUPS) if (g.items.some((i) => { const t = i.to.split("?")[0]; return path === t || path.startsWith(t + "/"); })) return g.label;
  return "League office";
};
