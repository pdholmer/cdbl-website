import { Link } from "react-router-dom";
import { ChevronDown, X } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface NavigationTrayProps {
  isOpen: boolean;
  onClose: () => void;
}

const NavigationTray = ({ isOpen, onClose }: NavigationTrayProps) => {
  const handleLinkClick = () => {
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sliding Tray */}
      <div 
        className={`
          fixed top-[136px] left-0 right-0 z-40 bg-background border-b border-border shadow-lg
          transition-all duration-300 ease-out
          ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}
        `}
      >
        <div className="container px-4 py-6 max-h-[70vh] overflow-y-auto">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-md hover:bg-muted transition-colors"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Navigation */}
          <nav className="flex flex-col gap-2 max-w-2xl mx-auto">
            {/* Registration & Teams */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-3 px-4 text-sm font-semibold uppercase text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
                <span>Registration & Teams</span>
                <ChevronDown className="h-5 w-5 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4 pt-2 space-y-1">
                <Link 
                  to="/registration" 
                  className="block text-left text-base font-medium text-foreground hover:text-primary transition-colors py-3 px-4 rounded-md hover:bg-muted" 
                  onClick={handleLinkClick}
                >
                  Registration
                </Link>
                <Link 
                  to="/teams" 
                  className="block text-left text-base font-medium text-foreground hover:text-primary transition-colors py-3 px-4 rounded-md hover:bg-muted" 
                  onClick={handleLinkClick}
                >
                  Teams
                </Link>
              </CollapsibleContent>
            </Collapsible>

            {/* Schedule & Fields */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-3 px-4 text-sm font-semibold uppercase text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
                <span>Schedule & Fields</span>
                <ChevronDown className="h-5 w-5 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4 pt-2 space-y-1">
                <Link 
                  to="/schedule" 
                  className="block text-left text-base font-medium text-foreground hover:text-primary transition-colors py-3 px-4 rounded-md hover:bg-muted" 
                  onClick={handleLinkClick}
                >
                  Schedule
                </Link>
                <Link 
                  to="/fields" 
                  className="block text-left text-base font-medium text-foreground hover:text-primary transition-colors py-3 px-4 rounded-md hover:bg-muted" 
                  onClick={handleLinkClick}
                >
                  Fields
                </Link>
                <Link 
                  to="/events" 
                  className="block text-left text-base font-medium text-foreground hover:text-primary transition-colors py-3 px-4 rounded-md hover:bg-muted" 
                  onClick={handleLinkClick}
                >
                  Events
                </Link>
              </CollapsibleContent>
            </Collapsible>

            {/* About CDBL */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-3 px-4 text-sm font-semibold uppercase text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
                <span>About CDBL</span>
                <ChevronDown className="h-5 w-5 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4 pt-2 space-y-1">
                <Link 
                  to="/new-to-cdbl" 
                  className="block text-left text-base font-medium text-foreground hover:text-primary transition-colors py-3 px-4 rounded-md hover:bg-muted" 
                  onClick={handleLinkClick}
                >
                  New to CDBL?
                </Link>
                <Link 
                  to="/about" 
                  className="block text-left text-base font-medium text-foreground hover:text-primary transition-colors py-3 px-4 rounded-md hover:bg-muted" 
                  onClick={handleLinkClick}
                >
                  About
                </Link>
                <Link 
                  to="/rules" 
                  className="block text-left text-base font-medium text-foreground hover:text-primary transition-colors py-3 px-4 rounded-md hover:bg-muted" 
                  onClick={handleLinkClick}
                >
                  Rules
                </Link>
                <Link 
                  to="/board" 
                  className="block text-left text-base font-medium text-foreground hover:text-primary transition-colors py-3 px-4 rounded-md hover:bg-muted" 
                  onClick={handleLinkClick}
                >
                  Board
                </Link>
                <Link 
                  to="/sponsors" 
                  className="block text-left text-base font-medium text-foreground hover:text-primary transition-colors py-3 px-4 rounded-md hover:bg-muted" 
                  onClick={handleLinkClick}
                >
                  Sponsors
                </Link>
              </CollapsibleContent>
            </Collapsible>

            {/* Get Involved */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-3 px-4 text-sm font-semibold uppercase text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
                <span>Get Involved</span>
                <ChevronDown className="h-5 w-5 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4 pt-2 space-y-1">
                <Link 
                  to="/volunteer" 
                  className="block text-left text-base font-medium text-foreground hover:text-primary transition-colors py-3 px-4 rounded-md hover:bg-muted" 
                  onClick={handleLinkClick}
                >
                  Volunteer
                </Link>
                <Link 
                  to="/contact" 
                  className="block text-left text-base font-medium text-foreground hover:text-primary transition-colors py-3 px-4 rounded-md hover:bg-muted" 
                  onClick={handleLinkClick}
                >
                  Contact
                </Link>
              </CollapsibleContent>
            </Collapsible>
          </nav>
        </div>
      </div>
    </>
  );
};

export default NavigationTray;
