import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useIsPageVisible } from "@/hooks/usePageVisibility";
import { AlertTriangle } from "lucide-react";
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
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
};
