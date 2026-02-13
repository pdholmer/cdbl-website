import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Home, HelpCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or may have been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/contact">
                <HelpCircle className="h-4 w-4 mr-2" />
                Contact Us
              </Link>
            </Button>
          </div>
          <div className="mt-8 text-sm text-muted-foreground">
            <p>Looking for something specific? Try these popular pages:</p>
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              <Link to="/registration" className="text-primary hover:underline">Registration</Link>
              <span>&middot;</span>
              <Link to="/schedule" className="text-primary hover:underline">Schedule</Link>
              <span>&middot;</span>
              <Link to="/teams" className="text-primary hover:underline">Teams</Link>
              <span>&middot;</span>
              <Link to="/fields" className="text-primary hover:underline">Fields</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
