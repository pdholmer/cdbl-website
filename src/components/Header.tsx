import { useState } from "react";
import cdblLogo from "@/assets/cdbl-logo-main.png";
import sportsConnectLogo from "@/assets/sportsconnect-logo.png";
import rocketLogo from "@/assets/rocket-blue.png";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Search, Facebook, Instagram, ChevronDown } from "lucide-react";
import WeatherDisplay from "@/components/WeatherDisplay";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
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
        <div className="container flex h-20 items-center justify-between px-4 gap-8">
          {/* Left: CDBL Logo */}
          <img 
            src={cdblLogo} 
            alt="CDBL Logo" 
            className="h-14 w-auto flex-shrink-0"
          />
          
          <div className="flex-1"></div>

          {/* Right: League Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-[0.8625rem] font-bold uppercase">
            <a href="#" className="text-primary-foreground hover:text-primary-foreground/80 transition-colors">FIELDS</a>
            <span className="text-primary-foreground/40">|</span>
            <a href="#" className="text-primary-foreground hover:text-primary-foreground/80 transition-colors">REGISTRATION</a>
            <span className="text-primary-foreground/40">|</span>
            <a 
              href="https://www.cdbaseball.org/page/show/9035619-scholarship" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-foreground hover:text-primary-foreground/80 transition-colors"
            >
              SCHOLARSHIP
            </a>
            <span className="text-primary-foreground/40">|</span>
            <a href="#" className="text-primary-foreground hover:text-primary-foreground/80 transition-colors">EVENTS</a>
            <span className="text-primary-foreground/40">|</span>
            <button className="text-primary-foreground hover:text-primary-foreground/80 transition-colors" aria-label="Search">
              <Search className="h-4 w-4" />
            </button>
            <span className="text-primary-foreground/40">|</span>
            <a href="#" className="text-primary-foreground hover:text-primary-foreground/80 transition-colors">SHOP</a>
            <span className="text-primary-foreground/40">|</span>
            <a href="#" className="text-primary-foreground hover:text-primary-foreground/80 transition-colors">DONATE</a>
          </nav>


          {/* Mobile Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <button 
                className="lg:hidden flex items-center gap-2 text-primary-foreground font-semibold"
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
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className="text-left text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                    >
                      {item.label}
                    </button>
                  ))}
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

      {/* White Header - Baseball Season Specific */}
      <div className="bg-background border-b border-border">
        <div className="container flex h-16 items-center justify-between px-4 gap-8">
          {/* Left: Weather Display aligned with CDBL logo */}
          <WeatherDisplay />
          
          <div className="flex-1"></div>

          {/* Right: Baseball Navigation + SportsConnect Button */}
          <div className="hidden lg:flex items-center gap-6">
            <nav className="flex items-center gap-6 text-[0.8625rem] font-medium">
              <a href="#" className="text-foreground hover:text-primary transition-colors">Schedule</a>
              <span className="text-muted-foreground">|</span>
              <a href="#" className="text-foreground hover:text-primary transition-colors">In-House</a>
              <span className="text-muted-foreground">|</span>
              <a href="#" className="text-foreground hover:text-primary transition-colors">Travel</a>
              <span className="text-muted-foreground">|</span>
              <a href="#" className="text-foreground hover:text-primary transition-colors">Coaches</a>
              <span className="text-muted-foreground">|</span>
              <a href="#" className="text-foreground hover:text-primary transition-colors">Board</a>
              <span className="text-muted-foreground">|</span>
              <button className="flex items-center gap-1 text-foreground hover:text-primary transition-colors">
                More <ChevronDown className="h-3 w-3" />
              </button>
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
        </div>
      </div>
    </header>
  );
};

export default Header;
