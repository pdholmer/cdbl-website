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


      {/* Top White Header - Future Rockets */}
      <div className="bg-background border-b border-border">
        <div className="container flex h-12 items-center justify-end px-4 gap-4">
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
          {/* SportsConnect Button */}
          <button
            className="p-2 bg-[#CC0000] hover:bg-[#AA0000] rounded-md transition-colors"
            onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2121019', '_blank')}
            aria-label="SportsConnect"
          >
            <img 
              src={sportsConnectLogo} 
              alt="SportsConnect" 
              className="h-8 w-auto"
            />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
