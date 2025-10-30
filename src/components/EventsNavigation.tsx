import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Users, Calendar, HandHeart } from "lucide-react";

export const EventsNavigation = () => {
  const location = useLocation();

  const navLinks = [
    { label: "Home", path: "/", icon: Home },
    { label: "Teams", path: "/teams", icon: Users },
    { label: "Schedule", path: "/schedule", icon: Calendar },
    { label: "Get Involved", path: "/volunteer", icon: HandHeart },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 text-sm font-heading font-semibold transition-colors hover:text-primary ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}
          </div>
          <Button asChild className="font-heading font-semibold">
            <Link to="/registration">Register Now</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};
