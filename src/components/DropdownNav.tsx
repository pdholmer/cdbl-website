import { Link } from "react-router-dom";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useHiddenSlugs } from "@/hooks/usePageVisibility";

const DropdownNav = () => {
  const hidden = useHiddenSlugs();

  const show = (slug: string) => !hidden.has(slug);

  return (
    <nav className="flex items-center gap-4 text-[0.8625rem] font-medium">
      {/* In-House Program Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-primary transition-colors focus:outline-none">
          In-House Program
          <ChevronDown className="h-3.5 w-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52 bg-background z-50">
          {show('in-house') && (
            <DropdownMenuItem asChild>
              <Link to="/in-house" className="w-full cursor-pointer">Overview</Link>
            </DropdownMenuItem>
          )}
          {show('in-house-teams') && (
            <DropdownMenuItem asChild>
              <Link to="/in-house/teams" className="w-full cursor-pointer">Teams & Divisions</Link>
            </DropdownMenuItem>
          )}
          {show('registration') && (
            <DropdownMenuItem asChild>
              <Link to="/registration" className="w-full cursor-pointer">Registration</Link>
            </DropdownMenuItem>
          )}
          {show('in-house-schedule') && (
            <DropdownMenuItem asChild>
              <Link to="/in-house/schedule" className="w-full cursor-pointer">Schedule</Link>
            </DropdownMenuItem>
          )}
          {show('in-house-rules') && (
            <DropdownMenuItem asChild>
              <Link to="/in-house/rules" className="w-full cursor-pointer">Rules & FAQ</Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <span className="text-muted-foreground">|</span>

      {/* Travel Program Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-primary transition-colors focus:outline-none">
          Travel Program
          <ChevronDown className="h-3.5 w-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52 bg-background z-50">
          {show('travel') && (
            <DropdownMenuItem asChild>
              <Link to="/travel" className="w-full cursor-pointer">Overview</Link>
            </DropdownMenuItem>
          )}
          {show('travel-registration') && (
            <DropdownMenuItem asChild>
              <Link to="/travel/registration" className="w-full cursor-pointer">Tryouts & Registration</Link>
            </DropdownMenuItem>
          )}
          {show('schedule') && (
            <DropdownMenuItem asChild>
              <Link to="/schedule" className="w-full cursor-pointer">Schedule</Link>
            </DropdownMenuItem>
          )}
          {show('travel-faq') && (
            <DropdownMenuItem asChild>
              <Link to="/travel/faq" className="w-full cursor-pointer">Travel FAQ</Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <span className="text-muted-foreground">|</span>

      {/* About CDBL Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-primary transition-colors focus:outline-none">
          About CDBL
          <ChevronDown className="h-3.5 w-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 bg-background z-50">
          {show('new-to-cdbl') && (
            <DropdownMenuItem asChild>
              <Link to="/new-to-cdbl" className="w-full cursor-pointer">New to CDBL?</Link>
            </DropdownMenuItem>
          )}
          {show('about') && (
            <DropdownMenuItem asChild>
              <Link to="/about" className="w-full cursor-pointer">About Us</Link>
            </DropdownMenuItem>
          )}
          {show('board') && (
            <DropdownMenuItem asChild>
              <Link to="/board" className="w-full cursor-pointer">Board & Leadership</Link>
            </DropdownMenuItem>
          )}
          {show('fields') && (
            <DropdownMenuItem asChild>
              <Link to="/fields" className="w-full cursor-pointer">Fields & Facilities</Link>
            </DropdownMenuItem>
          )}
          {show('rules') && (
            <DropdownMenuItem asChild>
              <Link to="/rules" className="w-full cursor-pointer">Rules & Policies</Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <span className="text-muted-foreground">|</span>

      {/* Get Involved Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-primary transition-colors focus:outline-none">
          Get Involved
          <ChevronDown className="h-3.5 w-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 bg-background z-50">
          {show('volunteer') && (
            <DropdownMenuItem asChild>
              <Link to="/volunteer" className="w-full cursor-pointer">Volunteer</Link>
            </DropdownMenuItem>
          )}
          {show('donate') && (
            <DropdownMenuItem asChild>
              <Link to="/donate" className="w-full cursor-pointer">Donate</Link>
            </DropdownMenuItem>
          )}
          {show('sponsors') && (
            <DropdownMenuItem asChild>
              <Link to="/sponsors" className="w-full cursor-pointer">Sponsors</Link>
            </DropdownMenuItem>
          )}
          {show('shop') && (
            <DropdownMenuItem asChild>
              <Link to="/shop" className="w-full cursor-pointer">Shop Spirit Wear</Link>
            </DropdownMenuItem>
          )}
          {show('contact') && (
            <DropdownMenuItem asChild>
              <Link to="/contact" className="w-full cursor-pointer">Contact</Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
};

export default DropdownNav;
