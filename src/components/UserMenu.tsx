import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogIn, LogOut, Settings, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface UserMenuProps {
  onMenuAction?: () => void;
  variant?: "desktop" | "mobile";
}

const UserMenu = ({ onMenuAction, variant = "desktop" }: UserMenuProps) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer admin check to prevent deadlock
        if (session?.user) {
          setTimeout(() => {
            checkAdminRole(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkAdminRole(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin'
      });
      
      if (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data === true);
      }
    } catch (error) {
      console.error('Error checking admin role:', error);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

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

  // Loading state
  if (isLoading) {
    return (
      <div className="h-5 w-5 animate-pulse bg-muted rounded-full" />
    );
  }

  // Not logged in
  if (!user) {
    if (variant === "mobile") {
      return (
        <Link
          to="/admin/login"
          onClick={onMenuAction}
          className="flex items-center gap-3 py-3 px-3 text-base font-medium text-foreground hover:text-primary transition-colors rounded-md hover:bg-muted"
        >
          <LogIn className="h-5 w-5" />
          <span>Sign In</span>
        </Link>
      );
    }

    return (
      <Link
        to="/admin/login"
        className="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors"
        aria-label="Sign in"
      >
        <LogIn className="h-5 w-5" />
      </Link>
    );
  }

  // Logged in - Mobile variant
  if (variant === "mobile") {
    return (
      <div className="space-y-1">
        <div className="py-2 px-3 text-sm font-semibold uppercase text-muted-foreground">
          Account
        </div>
        {isAdmin && (
          <Link
            to="/admin"
            onClick={onMenuAction}
            className="flex items-center gap-3 py-2 px-3 text-base font-medium text-foreground hover:text-primary transition-colors rounded-md hover:bg-muted"
          >
            <Shield className="h-5 w-5" />
            <span>Admin Dashboard</span>
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full py-2 px-3 text-base font-medium text-foreground hover:text-primary transition-colors rounded-md hover:bg-muted text-left"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    );
  }

  // Logged in - Desktop variant with dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors"
          aria-label="User menu"
        >
          <User className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-background border border-border shadow-lg z-50">
        <div className="px-2 py-1.5 text-sm text-muted-foreground truncate">
          {user.email}
        </div>
        <DropdownMenuSeparator />
        {isAdmin && (
          <>
            <DropdownMenuItem asChild>
              <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                <Shield className="h-4 w-4" />
                <span>Admin Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
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

export default UserMenu;
