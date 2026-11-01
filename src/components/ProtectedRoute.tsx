import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { getMfaStatus } from "@/lib/mfa";

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

      // Check for admin role
      const { data: hasAdminRole } = await supabase
        .rpc('has_role', {
          _user_id: session.user.id,
          _role: 'admin'
        });
      
      setIsAdmin(!!hasAdminRole);

      // If user is admin, they have board member access too
      if (hasAdminRole) {
        setIsBoardMember(true);
      } else if (requireBoardMember) {
        // Check for board_member role
        const { data: hasBoardMemberRole } = await supabase
          .rpc('has_role', {
            _user_id: session.user.id,
            _role: 'board_member'
          });
        
        setIsBoardMember(!!hasBoardMemberRole);
      }

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
  }, [requireAdmin, requireBoardMember, requireCoach]);

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

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (requireBoardMember && !isBoardMember) {
    return <Navigate to="/" replace />;
  }

  if (requireCoach && !isCoach) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
