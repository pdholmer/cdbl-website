import { useState } from "react";
import cdblLogo from "@/assets/cdbl-logo-main.png";
import sportsConnectLogo from "@/assets/sportsconnect-logo.png";
import rocketLogo from "@/assets/rocket-blue.png";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Search, Facebook, Instagram, ChevronDown } from "lucide-react";

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
        <div className="container flex h-16 items-center justify-between px-4 gap-8">
          {/* Left: CDBL Logo */}
          <img 
            src={cdblLogo} 
            alt="CDBL Logo" 
            className="h-12 w-auto flex-shrink-0"
          />
          
          {/* Center: League Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium">
            <a href="#" className="text-primary-foreground hover:text-primary-foreground/80 transition-colors">FIELDS</a>
            <a href="#" className="text-primary-foreground hover:text-primary-foreground/80 transition-colors">REGISTRATION</a>
            <a 
              href="https://www.cdbaseball.org/page/show/9035619-scholarship" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-foreground hover:text-primary-foreground/80 transition-colors"
            >
              SCHOLARSHIP
            </a>
            <a href="#" className="text-primary-foreground hover:text-primary-foreground/80 transition-colors">EVENTS</a>
            <button className="text-primary-foreground hover:text-primary-foreground/80 transition-colors" aria-label="Search">
              <Search className="h-4 w-4" />
            </button>
            <a href="#" className="text-primary-foreground hover:text-primary-foreground/80 transition-colors">SHOP</a>
            <a href="#" className="text-primary-foreground hover:text-primary-foreground/80 transition-colors">DONATE</a>
          </nav>

          {/* Right: Future Rockets Button + SportsConnect */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Future Rockets Button */}
            <Button 
              variant="secondary"
              className="text-xs font-extrabold tracking-[0.15em] bg-primary-light text-primary-foreground hover:bg-primary-light/90"
            >
              FUTURE ROCKETS START HERE
            </Button>

            {/* SportsConnect Button */}
            <button
              className="p-2 bg-[#CC0000] hover:bg-[#AA0000] rounded-md transition-colors flex-shrink-0"
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
        <div className="container flex h-10 items-center justify-end px-4">
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium">
            <a href="#" className="text-foreground hover:text-primary transition-colors">Schedule</a>
            <a href="#" className="text-foreground hover:text-primary transition-colors">In-House</a>
            <a href="#" className="text-foreground hover:text-primary transition-colors">Travel</a>
            <a href="#" className="text-foreground hover:text-primary transition-colors">Coaches</a>
            <a href="#" className="text-foreground hover:text-primary transition-colors">Board</a>
            <button className="flex items-center gap-1 text-foreground hover:text-primary transition-colors">
              More <ChevronDown className="h-3 w-3" />
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
