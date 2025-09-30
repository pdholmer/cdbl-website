import { useState } from "react";
import cdblLogo from "@/assets/cdbl-logo-white.png";
import sportsConnectLogo from "@/assets/sportsconnect-logo.png";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Search, X } from "lucide-react";

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
    <header className="sticky top-0 z-50 w-full bg-primary shadow-md">
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
          <Button
            variant="destructive"
            size="lg"
            className="hidden lg:flex items-center gap-2 bg-[#CC0000] hover:bg-[#AA0000] text-white font-bold"
            onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2121019', '_blank')}
          >
            <img 
              src={sportsConnectLogo} 
              alt="SportsConnect" 
              className="h-6 w-auto"
            />
            SportsConnect
          </Button>

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
                <Button
                  variant="destructive"
                  size="lg"
                  className="w-full flex items-center justify-center gap-2 bg-[#CC0000] hover:bg-[#AA0000] text-white font-bold mt-4"
                  onClick={() => {
                    window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2121019', '_blank');
                    setIsMenuOpen(false);
                  }}
                >
                  <img 
                    src={sportsConnectLogo} 
                    alt="SportsConnect" 
                    className="h-6 w-auto"
                  />
                  SportsConnect
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
