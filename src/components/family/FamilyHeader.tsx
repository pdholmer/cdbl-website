import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import seal from "@/assets/cdbl-seal.png";

interface FamilyHeaderProps {
  /** Context wordmark shown next to the seal. */
  context?: string;
}

/** Slim family-portal bar: CDBL seal home link, context wordmark, sign out. */
export const FamilyHeader = ({ context = "Household" }: FamilyHeaderProps) => {
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-[640px] items-center gap-3 px-4 sm:px-6">
        <Link
          to="/"
          aria-label="CDBL home"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-opacity hover:opacity-80"
        >
          <img src={seal} alt="Central DuPage Baseball League" className="h-10 w-10 object-contain" />
        </Link>
        <span className="min-w-0 flex-1 truncate font-heading text-[13px] font-bold uppercase tracking-[0.14em] text-primary">
          {context}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-11 shrink-0 rounded-xl px-3 text-muted-foreground"
          onClick={signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
          <span className="sr-only sm:hidden">Sign out</span>
        </Button>
      </div>
    </header>
  );
};

export default FamilyHeader;
