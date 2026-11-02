import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { LogOut, UserRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import seal from "@/assets/cdbl-seal.png";
import { LitHeader } from "@/components/shell/LitHeader";
import { canAccessAdminPath, fetchMyRoles } from "@/lib/adminAccess";
import { hasGuardianRecord, resolveLanding } from "@/lib/landing";
import { adminGroupLabel, adminGroupsFor, tabsFor, type NavLinkItem, type ShellArea } from "@/lib/shellNav";
import { cn } from "@/lib/utils";

interface AppShellProps {
  /** Fixed area, or "auto" to pick by the user's landing (family pages). */
  area: ShellArea | "auto";
  /** Small letterspaced label above the headline. */
  label?: string;
  /** Headline in the lit header. */
  title?: string;
  children: React.ReactNode;
  /** Extra content shown above the page inside main (admin banner). */
  banner?: React.ReactNode;
}

const AREA_LABEL: Record<ShellArea, string> = { admin: "CDBL · League office", coach: "CDBL · Coach", family: "CDBL · Family" };

const useShellIdentity = (fixed: AppShellProps["area"]) => {
  const [roles, setRoles] = useState<string[]>([]);
  const [area, setArea] = useState<ShellArea>(fixed === "auto" ? "family" : fixed);
  const [hasHousehold, setHasHousehold] = useState(false);
  const [isTeamCoach, setIsTeamCoach] = useState(false);
  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session || !alive) return;
      try { const r = await fetchMyRoles(session.user.id); if (alive) setRoles(r); } catch { /* nav falls back to basics */ }
      if (fixed === "auto") {
        try {
          const l = await resolveLanding(session.user.id);
          if (alive) setArea(l === "/admin" ? "admin" : l === "/coach" ? "coach" : "family");
        } catch { /* stay family */ }
      }
      try { const h = await hasGuardianRecord(session.user.id); if (alive) setHasHousehold(h); } catch { /* hide link */ }
      // Same coach read resolveLanding uses, for the "Coach" switch link.
      try {
        const c = await supabase.from("coaches").select("id").eq("user_id", session.user.id).limit(1);
        if (alive) setIsTeamCoach(!c.error && (c.data?.length ?? 0) > 0);
      } catch { /* hide link */ }
    });
    return () => { alive = false; };
  }, [fixed]);
  return { roles, area, hasHousehold, isTeamCoach };
};

const isActive = (item: NavLinkItem, pathname: string, hash: string) => {
  const [p, h] = item.to.split("?")[0].split("#");
  if (h) return pathname === p && hash === `#${h}`;
  if (p === "/admin" || p === "/coach" || p === "/household") return pathname === p && !hash;
  return pathname === p || pathname.startsWith(p + "/");
};

const scrollToHash = (to: string) => {
  const id = to.split("#")[1];
  if (!id) return;
  window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: "start" }), 60);
};

export const AppShell = ({ area: fixedArea, label, title, children, banner }: AppShellProps) => {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const { roles, area, hasHousehold, isTeamCoach } = useShellIdentity(fixedArea);
  const [moreOpen, setMoreOpen] = useState(false);

  const tabs = tabsFor(area, roles);
  const groups = area === "admin" ? adminGroupsFor(roles) : [];
  const headline = title ?? (area === "admin" ? adminGroupLabel(pathname) : area === "coach" ? "Coach" : "Household");

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/login");
  };

  const sideLink = (item: NavLinkItem) => (
    <NavLink
      key={item.to + item.label}
      to={item.to}
      onClick={() => scrollToHash(item.to)}
      className={cn(
        "flex min-h-[44px] items-center gap-3 rounded-full px-3 font-label text-[15px] font-semibold transition-colors",
        isActive(item, pathname, hash) ? "is-selected" : "text-foreground/85 hover:bg-muted",
      )}
    >
      {item.icon && <item.icon className="h-5 w-5 shrink-0" aria-hidden />}
      <span className="truncate">{item.label}</span>
    </NavLink>
  );

  // Area switches: show only areas this person can open, and not the one they are in.
  const canOpenAdmin = canAccessAdminPath(roles, "/admin");
  const canOpenCoach = roles.includes("coach") || isTeamCoach;
  const areaSwitches: NavLinkItem[] = [];
  if (canOpenAdmin && area !== "admin") areaSwitches.push({ label: "League office", to: "/admin" });
  if (canOpenCoach && area !== "coach") areaSwitches.push({ label: "Coach", to: "/coach" });
  if (hasHousehold && area !== "family") areaSwitches.push({ label: "My household", to: "/household" });

  const footerLinks: NavLinkItem[] = [
    { label: "Account", to: "/account" },
    ...areaSwitches,
    { label: "Back to cdbaseball.org", to: "/" },
  ];

  const nav = (
    <>
      {area === "admin" ? (
        <>
          {sideLink({ label: "Home", to: "/admin" })}
          {groups.map((g) => (
            <div key={g.label} className="mt-5">
              <p className="px-3 pb-1 font-label text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{g.label}</p>
              <div className="space-y-0.5">{g.items.map(sideLink)}</div>
            </div>
          ))}
        </>
      ) : (
        <div className="space-y-0.5">{tabs.filter((t) => !t.more).map(sideLink)}</div>
      )}
      <div className="mt-6 space-y-0.5 border-t border-border pt-4">
        {footerLinks.map(sideLink)}
        <button type="button" onClick={signOut} className="flex min-h-[44px] w-full items-center rounded-full px-3 font-label text-[15px] font-semibold text-foreground/85 hover:bg-muted">
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-background md:flex">
      {/* iPad and desktop sidebar */}
      <aside className="tex-mesh sticky top-0 hidden h-screen w-[220px] shrink-0 overflow-y-auto border-r border-border bg-card px-3 py-5 md:block">
        <Link to="/" aria-label="CDBL home" className="mb-5 flex min-h-[44px] items-center gap-3 px-2">
          <img src={seal} alt="Central District Baseball League" className="h-9 w-9 object-contain" />
          <span className="font-display text-lg font-black uppercase leading-none text-foreground">
            {area === "admin" ? "League office" : area === "coach" ? "Coach" : "Family"}
          </span>
        </Link>
        <nav aria-label="Main">{nav}</nav>
      </aside>

      <div className="min-w-0 flex-1">
        <LitHeader
          label={label ?? AREA_LABEL[area]}
          title={headline}
          sealPhoneOnly
          notice={
            area === "family" ? (
              /* Family phones have no More sheet, so the way back to the public site lives here. */
              <Link
                to="/"
                className="md:hidden -mr-1 inline-flex min-h-[44px] items-center px-1 text-[13px] font-semibold text-foreground/90 underline decoration-foreground/40 underline-offset-2 hover:decoration-foreground"
              >
                Back to cdbaseball.org
              </Link>
            ) : undefined
          }
          actions={
            <>
              <Link to="/account" aria-label="Account" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-foreground/80 hover:bg-foreground/10">
                <UserRound className="h-5 w-5" aria-hidden />
              </Link>
              <button type="button" onClick={signOut} aria-label="Sign out" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-foreground/80 hover:bg-foreground/10">
                <LogOut className="h-5 w-5" aria-hidden />
              </button>
            </>
          }
        />

        <main className="pb-[calc(88px+env(safe-area-inset-bottom))] md:pb-10">
          {banner}
          {children}
        </main>
      </div>

      {/* Phone tab bar */}
      <nav aria-label="Tabs" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
        <ul className="mx-auto grid max-w-lg grid-cols-5 gap-1 px-2 py-1.5">
          {tabs.map((t) => {
            const active = !t.more && isActive(t, pathname, hash);
            const inner = (
              <>
                {t.icon && <t.icon className="h-5 w-5" aria-hidden />}
                <span className="font-label text-[10px] font-semibold leading-none">{t.label}</span>
              </>
            );
            const cls = cn(
              "flex min-h-[48px] w-full flex-col items-center justify-center gap-1 rounded-full transition-colors motion-reduce:transition-none",
              active ? "is-selected" : "text-muted-foreground hover:text-foreground",
            );
            return (
              <li key={t.label}>
                {t.more ? (
                  <button type="button" className={cls} onClick={() => setMoreOpen(true)}>{inner}</button>
                ) : (
                  <Link to={t.to} className={cls} aria-current={active ? "page" : undefined} onClick={() => scrollToHash(t.to)}>{inner}</Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-xl motion-reduce:transition-none" onClick={(e) => { if ((e.target as HTMLElement).closest("a")) setMoreOpen(false); }}>
          <SheetHeader>
            <SheetTitle className="font-display text-2xl font-black uppercase">More</SheetTitle>
          </SheetHeader>
          <nav aria-label="More" className="mt-3 pb-[env(safe-area-inset-bottom)]">{nav}</nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AppShell;
