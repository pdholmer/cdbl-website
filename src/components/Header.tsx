import { useState } from "react";
import cdblLogo from "@/assets/cdbl-logo-main.png";
import sportsConnectLogo from "@/assets/sportsconnect-logo.png";
import rocketLogo from "@/assets/rocket-blue.png";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Search, Facebook, Instagram, ChevronDown, ShoppingCart, Heart } from "lucide-react";
import WeatherDisplay from "@/components/WeatherDisplay";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
          {/* Left: Search Icon - Desktop */}
          <button 
            className="hidden lg:flex text-primary-foreground hover:text-primary-foreground/80 transition-colors" 
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Center: CDBL Logo */}
          <div className="flex-1 lg:flex-none flex justify-center">
            <img 
              src={cdblLogo} 
              alt="CDBL Logo" 
              className="h-14 w-auto"
            />
          </div>

          {/* Right: Shop & Donate - Desktop */}
          <nav className="hidden lg:flex items-center gap-6 text-[0.8625rem] font-bold uppercase">
            <a href="#" className="text-primary-foreground hover:text-primary-foreground/80 transition-colors flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              SHOP
            </a>
            <span className="text-primary-foreground/40">|</span>
            <a href="#" className="text-primary-foreground hover:text-primary-foreground/80 transition-colors flex items-center gap-2">
              <Heart className="h-4 w-4" />
              DONATE
            </a>
          </nav>

          {/* Mobile: Search, Shop, Donate Icons */}
          <div className="flex lg:hidden items-center gap-4">
            <button 
              className="text-primary-foreground hover:text-primary-foreground/80 transition-colors" 
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <a href="#" className="text-primary-foreground hover:text-primary-foreground/80 transition-colors" aria-label="Shop">
              <ShoppingCart className="h-5 w-5" />
            </a>
            <a href="#" className="text-primary-foreground hover:text-primary-foreground/80 transition-colors" aria-label="Donate">
              <Heart className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

    </header>
  );
};

export default Header;
