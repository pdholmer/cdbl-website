import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { canAccessAdminPath, fetchMyRoles } from "@/lib/adminAccess";

/**
 * Session + roles for the public header. Roles come from the same read the
 * signed-in shell uses (public.user_roles via fetchMyRoles), and the admin
 * link is gated by canAccessAdminPath — no new access rule lives here.
 */
const useAuthState = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRoles = (uid: string) => {
      // Show the account button as soon as we know who is signed in;
      // roles arrive after and only add the League office link.
      setIsLoading(false);
      setTimeout(() => {
        fetchMyRoles(uid)
          .then(setRoles)
          .catch(() => setRoles([]));
      }, 0);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadRoles(session.user.id);
      } else {
        setRoles([]);
        setIsLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadRoles(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, roles, isLoading };
};

const pillClass =
  "inline-flex h-11 min-h-[44px] items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors";

const floodPill = `${pillClass} bg-primary text-primary-foreground hover:bg-primary/90`;
const quietPill = `${pillClass} border border-border bg-background text-foreground hover:bg-muted`;

interface UserMenuProps {
  onMenuAction?: () => void;
  variant?: "desktop" | "mobile";
}

const UserMenu = ({ onMenuAction, variant = "desktop" }: UserMenuProps) => {
  const { user, roles, isLoading } = useAuthState();
  const navigate = useNavigate();
  const { toast } = useToast();

  const canOpenAdmin = canAccessAdminPath(roles, "/admin");

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate("/");
      onMenuAction?.();
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="h-11 w-24 animate-pulse rounded-full bg-muted" />;
  }

  // Not logged in
  if (!user) {
    if (variant === "mobile") {
      return (
        <Link
          to="/login"
          onClick={onMenuAction}
          className="flex min-h-[44px] items-center px-3 py-3 text-base font-medium text-foreground hover:text-primary transition-colors rounded-md hover:bg-muted"
        >
          <span>Sign In</span>
        </Link>
      );
    }

    return (
      <Link to="/login" className={floodPill}>
        Sign in
      </Link>
    );
  }

  // Logged in - Mobile variant (MENU sheet)
  if (variant === "mobile") {
    const sheetLink =
      "flex min-h-[44px] items-center px-3 py-3 text-base font-medium text-foreground hover:text-primary transition-colors rounded-md hover:bg-muted";

    return (
      <div className="space-y-1">
        {canOpenAdmin && (
          <Link to="/admin" onClick={onMenuAction} className={sheetLink}>
            <span>League office</span>
          </Link>
        )}
        <Link to="/household" onClick={onMenuAction} className={sheetLink}>
          <span>My household</span>
        </Link>
        <Link to="/account" onClick={onMenuAction} className={sheetLink}>
          <span>Account</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex min-h-[44px] w-full items-center px-3 py-3 text-left text-base font-medium text-foreground hover:text-primary transition-colors rounded-md hover:bg-muted"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    );
  }

  // Logged in - Desktop variant with dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={quietPill} aria-label="Account menu">
          My account
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-background border border-border shadow-lg z-50">
        <div className="px-2 py-1.5 text-sm text-muted-foreground truncate">
          {user.email}
        </div>
        <DropdownMenuSeparator />
        {canOpenAdmin && (
          <>
            <DropdownMenuItem asChild>
              <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                <span>League office</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem asChild>
          <Link to="/household" className="flex items-center gap-2 cursor-pointer">
            <span>My household</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/account" className="flex items-center gap-2 cursor-pointer">
            <span>Account</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/**
 * Small "Sign in" link for the white header bar on phones and tablets, so the
 * sign-in door is visible without opening MENU. Renders nothing when signed in.
 */
export const SignInInline = () => {
  const { user, isLoading } = useAuthState();

  if (isLoading || user) return null;

  return (
    <Link
      to="/login"
      className="lg:hidden inline-flex min-h-[44px] items-center px-2 text-sm font-semibold text-primary hover:underline"
    >
      Sign in
    </Link>
  );
};

export default UserMenu;
