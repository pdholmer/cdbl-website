import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useIsPageVisible } from "@/hooks/usePageVisibility";
import { AlertTriangle, Calendar, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface PageGateProps {
  slug: string;
  children: ReactNode;
}

export const PageGate = ({ slug, children }: PageGateProps) => {
  const { isVisible, message, isLoading } = useIsPageVisible(slug);

  if (isLoading) return null;
  if (isVisible) return <>{children}</>;

  return (
    <>
      <Header />
      <main className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Page Unavailable</h1>
          {message ? (
            <p className="text-muted-foreground">{message}</p>
          ) : (
            <p className="text-muted-foreground">This page is temporarily unavailable. Please check back later.</p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/">
              <Button>Go Home</Button>
            </Link>
          </div>
          <div className="border-t pt-6">
            <p className="text-sm text-muted-foreground mb-3">While you're here, explore:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button variant="outline" size="sm" asChild>
                <Link to="/schedule"><Calendar className="mr-1 h-4 w-4" /> Schedule</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/teams"><Users className="mr-1 h-4 w-4" /> Teams</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/volunteer"><Heart className="mr-1 h-4 w-4" /> Volunteer</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};
