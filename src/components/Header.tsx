import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import cdblLogo from "@/assets/cdbl-logo-main.png";
import sportsConnectLogo from "@/assets/sportsconnect-logo.png";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ShoppingCart, Heart } from "lucide-react";
import WeatherDisplay from "@/components/WeatherDisplay";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showShop, setShowShop] = useState(true);

  // Rotate between Shop and Donate every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShowShop(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  const navItems = [
    { id: "about", label: "About" },
    { id: "registration", label: "Registration" },
    { id: "spirit-wear", label: "Spirit Wear" },
    { id: "umpires", label: "Umpires" },
    { id: "sponsors", label: "Sponsors" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full shadow-md">
      {/* Blue Header - League Overview */}
      <div className="bg-primary border-b border-primary-foreground/10">
        <div className="container relative flex h-20 items-center justify-between px-4 gap-4">
          {/* Left: Weather Display */}
          <div className="z-10">
            <WeatherDisplay />
          </div>

          {/* Center: CDBL Logo - Absolutely centered on page */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <img 
              src={cdblLogo} 
              alt="CDBL Logo" 
              className="h-14 w-auto"
            />
          </div>

          {/* Right: Shop & Donate */}
          <div className="flex items-center gap-6 z-10">
            {/* Desktop: Shop & Donate with labels */}
            <nav className="hidden lg:flex items-center gap-6 text-[0.8625rem] font-bold uppercase">
              <Link to="/shop" className="text-primary-foreground hover:text-primary-foreground/80 transition-colors flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                SHOP
              </Link>
              <span className="text-primary-foreground/40">|</span>
              <Link to="/volunteer" className="text-primary-foreground hover:text-primary-foreground/80 transition-colors flex items-center gap-2">
                <Heart className="h-4 w-4" />
                DONATE
              </Link>
            </nav>

            {/* Mobile/Tablet: Rotating Shop/Donate button */}
            <Link 
              to={showShop ? "/shop" : "/volunteer"} 
              className="lg:hidden text-primary-foreground hover:text-primary-foreground/80 transition-colors flex items-center gap-2 text-[0.8625rem] font-bold uppercase"
              aria-label={showShop ? "Shop" : "Donate"}
            >
              {showShop ? (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  <span>SHOP</span>
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4" />
                  <span>DONATE</span>
                </>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* White Header - Baseball Season Specific */}
      <div className="bg-background border-b border-border">
        <div className="container flex h-16 items-center justify-between px-4 gap-8">
          {/* Search Bar - Persistent across all views */}
          <div className="relative w-full max-w-xs">
            <input
              type="search"
              placeholder="Search..."
              className="w-full h-10 px-4 rounded-md bg-muted text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              aria-label="Search"
            />
          </div>
          
          <div className="flex-1"></div>

            {/* Right: Navigation + SportsConnect Button */}
            <div className="hidden lg:flex items-center gap-6">
              <nav className="flex items-center gap-6 text-[0.8625rem] font-medium">
                <Link to="/registration" className="text-foreground hover:text-primary transition-colors">Register</Link>
                <span className="text-muted-foreground">|</span>
                <Link to="/teams" className="text-foreground hover:text-primary transition-colors">Teams</Link>
                <span className="text-muted-foreground">|</span>
                <Link to="/schedule" className="text-foreground hover:text-primary transition-colors">Schedule</Link>
                <span className="text-muted-foreground">|</span>
                <Link to="/fields" className="text-foreground hover:text-primary transition-colors">Fields</Link>
                <span className="text-muted-foreground">|</span>
                <Link to="/events" className="text-foreground hover:text-primary transition-colors">Events</Link>
              </nav>

            {/* SportsConnect Button */}
            <button
              className="p-3 bg-[#CC0000] hover:bg-[#AA0000] rounded-md transition-colors"
              onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2121019', '_blank')}
              aria-label="SportsConnect"
            >
              <img 
                src={sportsConnectLogo} 
                alt="SportsConnect" 
                className="h-6 w-auto"
              />
            </button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <button 
                className="lg:hidden flex items-center gap-2 text-foreground font-semibold"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
                <span className="text-sm">MENU</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
              <div className="flex flex-col gap-6 mt-8">
                {/* Mobile Navigation */}
                <nav className="flex flex-col gap-4">
                  <Link to="/registration" className="text-left text-lg font-medium text-foreground hover:text-primary transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                    Registration
                  </Link>
                  <Link to="/teams" className="text-left text-lg font-medium text-foreground hover:text-primary transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                    Teams
                  </Link>
                  <Link to="/schedule" className="text-left text-lg font-medium text-foreground hover:text-primary transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                    Schedule
                  </Link>
                  <Link to="/fields" className="text-left text-lg font-medium text-foreground hover:text-primary transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                    Fields
                  </Link>
                  <Link to="/events" className="text-left text-lg font-medium text-foreground hover:text-primary transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                    Events
                  </Link>
                  <Link to="/about" className="text-left text-lg font-medium text-foreground hover:text-primary transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                    About
                  </Link>
                  <Link to="/rules" className="text-left text-lg font-medium text-foreground hover:text-primary transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                    Rules
                  </Link>
                  <Link to="/volunteer" className="text-left text-lg font-medium text-foreground hover:text-primary transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                    Volunteer
                  </Link>
                  <Link to="/sponsors" className="text-left text-lg font-medium text-foreground hover:text-primary transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                    Sponsors
                  </Link>
                  <Link to="/contact" className="text-left text-lg font-medium text-foreground hover:text-primary transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                    Contact
                  </Link>
                </nav>

                {/* SportsConnect Button - Mobile */}
                <button
                  className="w-full flex items-center justify-center p-4 bg-[#CC0000] hover:bg-[#AA0000] rounded-md transition-colors mt-4"
                  onClick={() => {
                    window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2121019', '_blank');
                    setIsMenuOpen(false);
                  }}
                  aria-label="SportsConnect"
                >
                  <img 
                    src={sportsConnectLogo} 
                    alt="SportsConnect" 
                    className="h-8 w-auto"
                  />
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

    </header>
  );
};

export default Header;
