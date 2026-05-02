import { useState } from "react";
import { Link } from "react-router-dom";
import cdblLogo from "@/assets/cdbl-logo-main.png";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ChevronDown, X } from "lucide-react";
import WeatherDisplay from "@/components/WeatherDisplay";
import DropdownNav from "@/components/DropdownNav";
import SearchTray from "@/components/SearchTray";
import UserMenu from "@/components/UserMenu";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useHiddenSlugs } from "@/hooks/usePageVisibility";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const hidden = useHiddenSlugs();
  const show = (slug: string) => !hidden.has(slug);



  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  const mobileLink = (to: string, label: string) => (
    <Link to={to} className="block text-left text-base font-medium text-foreground hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-muted" onClick={() => setIsMenuOpen(false)}>
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full shadow-md">
      {/* Blue Header */}
      <div className="bg-primary border-b border-primary-foreground/10">
        <div className="container relative flex h-20 items-center justify-between px-4 gap-4">
          <div className="z-10">
            <WeatherDisplay />
          </div>
          <Link to="/" className="absolute left-1/2 -translate-x-1/2">
            <img src={cdblLogo} alt="CDBL Logo" className="h-14 w-auto cursor-pointer hover:opacity-80 transition-opacity" />
          </Link>
          <div className="flex items-center gap-6 z-10">
            {show('shop') && <Link to="/shop" className="hidden md:block text-primary-foreground hover:text-primary-foreground/80 transition-colors text-[0.8625rem] font-bold uppercase">SHOP</Link>}
            {show('donate') && <Link to="/donate" className="hidden md:block text-primary-foreground hover:text-primary-foreground/80 transition-colors text-[0.8625rem] font-bold uppercase">DONATE</Link>}
            {/* Mobile: show both, side-by-side */}
            <div className="flex md:hidden items-center gap-2">
              {show('shop') && (
                <Link to="/shop" className="text-primary-foreground hover:text-primary-foreground/80 transition-colors text-[0.75rem] font-bold uppercase">
                  SHOP
                </Link>
              )}
              {show('shop') && show('donate') && (
                <span aria-hidden="true" className="h-3 w-px bg-primary-foreground/40" />
              )}
              {show('donate') && (
                <Link to="/donate" className="text-primary-foreground hover:text-primary-foreground/80 transition-colors text-[0.75rem] font-bold uppercase">
                  DONATE
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* White Header */}
      <div className="bg-background border-b border-border">
        <div className="container flex h-16 items-center px-4 gap-6 lg:gap-8">
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
              <button onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-accent transition-colors" aria-label="Close search">
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
            <DropdownNav />
            <span className="text-muted-foreground">|</span>
            {show('schedule') && (
              <Link to="/schedule" className="text-[0.8625rem] font-medium text-foreground hover:text-primary transition-colors">
                Schedule
              </Link>
            )}
            <span className="text-muted-foreground">|</span>
            <UserMenu variant="desktop" />
          </div>

          {/* Mobile Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <button className="lg:hidden flex items-center gap-2 text-foreground font-semibold flex-shrink-0" aria-label="Open menu">
                <Menu className="h-6 w-6" />
                <span className="text-sm">MENU</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
              <div className="flex flex-col gap-4 mt-8">
                <nav className="flex flex-col gap-2">
                  {/* In-House Program */}
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 text-sm font-semibold uppercase text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
                      <span>In-House Program</span>
                      <ChevronDown className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-3 pt-2 space-y-1">
                      {show('in-house') && mobileLink("/in-house", "Overview")}
                      {show('in-house-teams') && mobileLink("/in-house/teams", "Teams & Divisions")}
                      {show('registration') && mobileLink("/in-house/registration", "Registration")}
                      {show('in-house-schedule') && mobileLink("/in-house/schedule", "Schedule")}
                      {show('in-house-rules') && mobileLink("/in-house/rules", "Rules & FAQ")}
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Travel Program */}
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 text-sm font-semibold uppercase text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
                      <span>Travel Program</span>
                      <ChevronDown className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-3 pt-2 space-y-1">
                      {show('travel') && mobileLink("/travel", "Overview")}
                      {show('travel-registration') && mobileLink("/travel/registration", "Tryouts & Registration")}
                      {show('schedule') && mobileLink("/schedule", "Schedule")}
                      {show('travel-faq') && mobileLink("/travel/faq", "Travel FAQ")}
                    </CollapsibleContent>
                  </Collapsible>

                  {/* About CDBL */}
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 text-sm font-semibold uppercase text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
                      <span>About CDBL</span>
                      <ChevronDown className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-3 pt-2 space-y-1">
                      {show('new-to-cdbl') && mobileLink("/new-to-cdbl", "New to CDBL?")}
                      {show('about') && mobileLink("/about", "About Us")}
                      {show('board') && mobileLink("/board", "Board & Leadership")}
                      {show('fields') && mobileLink("/fields", "Fields & Facilities")}
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Get Involved */}
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 text-sm font-semibold uppercase text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
                      <span>Get Involved</span>
                      <ChevronDown className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-3 pt-2 space-y-1">
                      {show('volunteer') && mobileLink("/volunteer", "Volunteer")}
                      {show('donate') && mobileLink("/donate", "Donate")}
                      {show('sponsors') && mobileLink("/sponsors", "Sponsors")}
                      {show('shop') && mobileLink("/shop", "Shop Spirit Wear")}
                      {show('contact') && mobileLink("/contact", "Contact")}
                    </CollapsibleContent>
                  </Collapsible>
                </nav>

                <div className="border-t border-border pt-4 mt-2">
                  <UserMenu variant="mobile" onMenuAction={() => setIsMenuOpen(false)} />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <SearchTray 
        isOpen={isSearchOpen} 
        searchQuery={searchQuery}
        onClose={() => { setIsSearchOpen(false); setSearchQuery(""); }}
      />
    </header>
  );
};

export default Header;
