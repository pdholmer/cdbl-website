import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { getMfaStatus } from "@/lib/mfa";
import { canAccessAdminPath, fetchMyRoles, isStaff } from "@/lib/adminAccess";
import NoAccess from "@/pages/admin/NoAccess";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireBoardMember?: boolean;
  requireCoach?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requireAdmin = false,
  requireBoardMember = false,
  requireCoach = false 
}: ProtectedRouteProps) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBoardMember, setIsBoardMember] = useState(false);
  const [isCoach, setIsCoach] = useState(false);
  const [isStaffUser, setIsStaffUser] = useState(false);
  const [pathAllowed, setPathAllowed] = useState(false);
  const [mfaRedirect, setMfaRedirect] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);

      // Two-step sign-in gate for admin, registrar, treasurer, background_checks.
      try {
        const status = await getMfaStatus(session.user.id);
        setMfaRedirect(
          status === "needs_setup" ? "/two-step/setup" : status === "needs_code" ? "/two-step/verify" : null
        );
      } catch {
        // Fail closed: if we cannot confirm, ask for the code.
        setMfaRedirect("/two-step/verify");
      }

      // Admin panel: section access decided only in src/lib/adminAccess.ts.
      let roles: string[] = [];
      try { roles = await fetchMyRoles(session.user.id); } catch { roles = []; }
      const hasAdminRole = roles.includes("admin");
      setIsAdmin(hasAdminRole);
      setIsStaffUser(isStaff(roles));
      setPathAllowed(canAccessAdminPath(roles, location.pathname));
      setIsBoardMember(hasAdminRole || roles.includes("board_member"));

      if (requireCoach) {
        // Check for coach role
        const { data: hasCoachRole } = await supabase
          .rpc('has_role', {
            _user_id: session.user.id,
            _role: 'coach'
          });
        
        // Admins can also access coach pages
        setIsCoach(!!hasCoachRole || !!hasAdminRole);
      }

      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });

    return () => subscription.unsubscribe();
  }, [requireAdmin, requireBoardMember, requireCoach, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-32 w-32" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (mfaRedirect) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${mfaRedirect}?next=${next}`} replace />;
  }

  if (requireAdmin || requireBoardMember) {
    if (!isStaffUser) return <Navigate to="/" replace />;
    if (!pathAllowed) return <NoAccess />;
  }

  if (requireCoach && !isCoach) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
