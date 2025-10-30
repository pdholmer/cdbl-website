import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Users, Calendar, HandHeart, Menu as MenuIcon } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const EventsNavigation = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const navLinks = [
    { label: "Home", path: "/", icon: Home },
    { label: "Teams", path: "/teams", icon: Users },
    { label: "Schedule", path: "/schedule", icon: Calendar },
    { label: "Get Involved", path: "/volunteer", icon: HandHeart },
  ];

  return (
    <>
      {/* Desktop Navigation - Sticky */}
      <nav className="hidden md:block sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
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
                    {link.label}
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

      {/* Mobile Navigation - Sticky Bottom */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
        <div className="flex items-center justify-around h-16 px-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex flex-col items-center justify-center gap-1 flex-1 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{link.label}</span>
              </Link>
            );
          })}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center gap-1 flex-1 text-muted-foreground">
                <MenuIcon className="h-5 w-5" />
                <span className="text-xs font-medium">Menu</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[60vh]">
              <SheetHeader>
                <SheetTitle className="font-heading">Quick Links</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-6">
                <Button asChild size="lg" className="w-full font-heading font-semibold">
                  <Link to="/registration" onClick={() => setOpen(false)}>
                    Register Now
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full font-heading">
                  <Link to="/donate" onClick={() => setOpen(false)}>
                    Donate
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full font-heading">
                  <Link to="/about" onClick={() => setOpen(false)}>
                    About CDBL
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </>
  );
};
