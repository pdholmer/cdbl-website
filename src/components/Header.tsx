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
      {/* Middle Blue Header - League Links with CDBL Logo */}
      <div className="bg-primary border-b border-primary-foreground/10">
        <div className="container flex h-16 items-center justify-between px-4">
          <img 
            src={cdblLogo} 
            alt="CDBL Logo" 
            className="h-12 w-auto"
          />
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
        </div>
      </div>

      {/* Bottom White Header - Baseball Specific */}
      <div className="bg-background border-b border-border">
        <div className="container flex h-10 items-center px-4">
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

      {/* Main Blue Header - CDBL */}
      <div className="bg-primary">
        <div className="container flex h-20 items-center justify-between px-4">
          {/* Logo and Tagline */}
          <div className="flex items-center gap-3">
            <img 
              src={cdblLogo} 
              alt="CDBL Logo" 
              className="h-14 w-auto md:h-16"
            />
            <div className="flex flex-col">
              <span className="text-[10px] md:text-xs font-medium text-primary-foreground/80 tracking-wide">
                HOME OF THE
              </span>
              <span className="text-lg md:text-2xl font-bold text-primary-foreground tracking-tight">
                ROCKETS
              </span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-sm font-medium text-primary-foreground hover:text-primary-foreground/80 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Side: Search & SportsConnect (Desktop) + Mobile Menu */}
          <div className="flex items-center gap-3">
            {/* Search Icon */}
            <button 
              className="p-2 text-primary-foreground hover:text-primary-foreground/80 transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* SportsConnect Button - Desktop */}
            <button
              className="hidden lg:block p-2 bg-[#CC0000] hover:bg-[#AA0000] rounded-md transition-colors"
              onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2121019', '_blank')}
              aria-label="SportsConnect"
            >
              <img 
                src={sportsConnectLogo} 
                alt="SportsConnect" 
                className="h-8 w-auto"
              />
            </button>

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
      </div>

      {/* Top White Header - Future Rockets */}
      <div className="bg-background border-b border-border">
        <div className="container flex h-12 items-center justify-between px-4">
          <div className="flex items-center">
            <span className="text-sm font-extrabold tracking-[0.2em] text-foreground">
              FUTURE ROCKETS START HERE
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <img src={rocketLogo} alt="Rocket" className="h-6 w-auto" />
            <span className="text-xs font-semibold text-muted-foreground">SOCIAL:</span>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
