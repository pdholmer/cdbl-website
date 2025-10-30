import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import cdblLogo from "@/assets/cdbl-logo-main.png";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ChevronDown, X } from "lucide-react";
import WeatherDisplay from "@/components/WeatherDisplay";
import DropdownNav from "@/components/DropdownNav";
import SearchTray from "@/components/SearchTray";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showShop, setShowShop] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
          <Link to="/" className="absolute left-1/2 -translate-x-1/2">
            <img 
              src={cdblLogo} 
              alt="CDBL Logo" 
              className="h-14 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            />
          </Link>

          {/* Right: Shop & Donate */}
          <div className="flex items-center gap-6 z-10">
            {/* Desktop/Tablet: Both Shop and Donate links */}
            <Link to="/shop" className="hidden md:block text-primary-foreground hover:text-primary-foreground/80 transition-colors text-[0.8625rem] font-bold uppercase">
              SHOP
            </Link>
            <Link to="/donate" className="hidden md:block text-primary-foreground hover:text-primary-foreground/80 transition-colors text-[0.8625rem] font-bold uppercase">
              DONATE
            </Link>

            {/* Mobile only: Rotating Shop/Donate button */}
            <Link 
              to={showShop ? "/shop" : "/donate"} 
              className="md:hidden text-primary-foreground hover:text-primary-foreground/80 transition-colors text-[0.8625rem] font-bold uppercase"
              aria-label={showShop ? "Shop" : "Donate"}
            >
              {showShop ? "SHOP" : "DONATE"}
            </Link>
          </div>
        </div>
      </div>

      {/* White Header - Baseball Season Specific */}
      <div className="bg-background border-b border-border">
        <div className="container flex h-16 items-center px-4 gap-6 lg:gap-8">
          {/* Search Bar - Persistent across all views */}
          <div className="relative flex-1 max-w-3xl">
            <input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full h-10 px-4 pr-10 rounded-md bg-muted text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring text-base md:text-sm touch-action-manipulation"
              aria-label="Search"
            />
            {isSearchOpen && (
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery("");
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-accent transition-colors"
                aria-label="Close search"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          {/* Right: Navigation */}
          <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
            <DropdownNav />
            
            <span className="text-muted-foreground">|</span>
            
            <Link 
              to="/schedule" 
              className="text-[0.8625rem] font-medium text-foreground hover:text-primary transition-colors"
            >
              Schedule
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <button 
                className="lg:hidden flex items-center gap-2 text-foreground font-semibold flex-shrink-0"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
                <span className="text-sm">MENU</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
              <div className="flex flex-col gap-4 mt-8">
                {/* Mobile Navigation - Collapsible Categories */}
                <nav className="flex flex-col gap-2">
                  {/* In-House Program */}
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 text-sm font-semibold uppercase text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
                      <span>In-House Program</span>
                      <ChevronDown className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-3 pt-2 space-y-1">
                      <Link to="/in-house" className="block text-left text-base font-medium text-foreground hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-muted" onClick={() => setIsMenuOpen(false)}>
                        Overview
                      </Link>
                      <Link to="/in-house/teams" className="block text-left text-base font-medium text-foreground hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-muted" onClick={() => setIsMenuOpen(false)}>
                        Teams & Divisions
                      </Link>
                      <Link to="/in-house/registration" className="block text-left text-base font-medium text-foreground hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-muted" onClick={() => setIsMenuOpen(false)}>
                        Registration
                      </Link>
                      <Link to="/in-house/schedule" className="block text-left text-base font-medium text-foreground hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-muted" onClick={() => setIsMenuOpen(false)}>
                        Schedule
                      </Link>
                      <Link to="/in-house/rules" className="block text-left text-base font-medium text-foreground hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-muted" onClick={() => setIsMenuOpen(false)}>
                        Rules & FAQ
                      </Link>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Travel Program */}
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 text-sm font-semibold uppercase text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
                      <span>Travel Program</span>
                      <ChevronDown className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-3 pt-2 space-y-1">
                      <Link to="/travel" className="block text-left text-base font-medium text-foreground hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-muted" onClick={() => setIsMenuOpen(false)}>
                        Overview
                      </Link>
                      <Link to="/travel/teams" className="block text-left text-base font-medium text-foreground hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-muted" onClick={() => setIsMenuOpen(false)}>
                        Rockets Teams
                      </Link>
                      <Link to="/travel/registration" className="block text-left text-base font-medium text-foreground hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-muted" onClick={() => setIsMenuOpen(false)}>
                        Tryouts & Registration
                      </Link>
                      <Link to="/travel/schedule" className="block text-left text-base font-medium text-foreground hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-muted" onClick={() => setIsMenuOpen(false)}>
                        Tournament Schedule
                      </Link>
                      <Link to="/travel/faq" className="block text-left text-base font-medium text-foreground hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-muted" onClick={() => setIsMenuOpen(false)}>
                        Travel FAQ
                      </Link>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* About CDBL */}
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 text-sm font-semibold uppercase text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
                      <span>About CDBL</span>
                      <ChevronDown className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-3 pt-2 space-y-1">
                      <Link to="/new-to-cdbl" className="block text-left text-base font-medium text-foreground hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-muted" onClick={() => setIsMenuOpen(false)}>
                        New to CDBL?
                      </Link>
                      <Link to="/about" className="block text-left text-base font-medium text-foreground hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-muted" onClick={() => setIsMenuOpen(false)}>
                        About Us
                      </Link>
                      <Link to="/board" className="block text-left text-base font-medium text-foreground hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-muted" onClick={() => setIsMenuOpen(false)}>
                        Board & Leadership
                      </Link>
                      <Link to="/fields" className="block text-left text-base font-medium text-foreground hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-muted" onClick={() => setIsMenuOpen(false)}>
                        Fields & Facilities
                      </Link>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Get Involved */}
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 text-sm font-semibold uppercase text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
                      <span>Get Involved</span>
                      <ChevronDown className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-3 pt-2 space-y-1">
                      <Link to="/volunteer" className="block text-left text-base font-medium text-foreground hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-muted" onClick={() => setIsMenuOpen(false)}>
                        Volunteer
                      </Link>
                      <Link to="/donate" className="block text-left text-base font-medium text-foreground hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-muted" onClick={() => setIsMenuOpen(false)}>
                        Donate
                      </Link>
                      <Link to="/sponsors" className="block text-left text-base font-medium text-foreground hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-muted" onClick={() => setIsMenuOpen(false)}>
                        Sponsors
                      </Link>
                      <Link to="/shop" className="block text-left text-base font-medium text-foreground hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-muted" onClick={() => setIsMenuOpen(false)}>
                        Shop Spirit Wear
                      </Link>
                      <Link to="/contact" className="block text-left text-base font-medium text-foreground hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-muted" onClick={() => setIsMenuOpen(false)}>
                        Contact
                      </Link>
                    </CollapsibleContent>
                  </Collapsible>
                </nav>

                {/* SportsConnect Button - Mobile */}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Search Tray */}
      <SearchTray 
        isOpen={isSearchOpen} 
        searchQuery={searchQuery}
        onClose={() => {
          setIsSearchOpen(false);
          setSearchQuery("");
        }}
      />
    </header>
  );
};

export default Header;
