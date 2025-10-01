import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

const DropdownNav = () => {
  return (
    <nav className="flex items-center gap-6 text-[0.8625rem] font-medium">
      {/* About CDBL Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-primary transition-colors focus:outline-none">
          About CDBL
          <ChevronDown className="h-3.5 w-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 bg-background">
          <DropdownMenuItem asChild>
            <Link to="/new-to-cdbl" className="w-full cursor-pointer">
              New to CDBL?
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/about" className="w-full cursor-pointer">
              About
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/rules" className="w-full cursor-pointer">
              Rules
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/board" className="w-full cursor-pointer">
              Board
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/sponsors" className="w-full cursor-pointer">
              Sponsors
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <span className="text-muted-foreground">|</span>

      {/* Season Info Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-primary transition-colors focus:outline-none">
          Season Info
          <ChevronDown className="h-3.5 w-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 bg-background">
          <DropdownMenuItem asChild>
            <Link to="/registration" className="w-full cursor-pointer">
              Registration
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/teams" className="w-full cursor-pointer">
              Teams
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/schedule" className="w-full cursor-pointer">
              Schedule
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/fields" className="w-full cursor-pointer">
              Fields
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/events" className="w-full cursor-pointer">
              Events
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <span className="text-muted-foreground">|</span>

      {/* Get Involved Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-primary transition-colors focus:outline-none">
          Get Involved
          <ChevronDown className="h-3.5 w-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 bg-background">
          <DropdownMenuItem asChild>
            <Link to="/volunteer" className="w-full cursor-pointer">
              Volunteer
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/contact" className="w-full cursor-pointer">
              Contact
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
};

export default DropdownNav;
