import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
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
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sliding Tray */}
      <div 
        className={`fixed top-[136px] left-0 right-0 z-50 bg-background border-b border-border shadow-lg transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="container py-8 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Registration & Teams */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-bold uppercase text-primary hover:text-primary/80 transition-colors group">
                <span>Registration & Teams</span>
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 space-y-2">
                <Link 
                  to="/registration" 
                  className="block text-base font-medium text-foreground hover:text-primary transition-colors py-1.5"
                  onClick={onClose}
                >
                  Registration
                </Link>
                <Link 
                  to="/teams" 
                  className="block text-base font-medium text-foreground hover:text-primary transition-colors py-1.5"
                  onClick={onClose}
                >
                  Teams
                </Link>
              </CollapsibleContent>
            </Collapsible>

            {/* Schedule & Fields */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-bold uppercase text-primary hover:text-primary/80 transition-colors group">
                <span>Schedule & Fields</span>
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 space-y-2">
                <Link 
                  to="/schedule" 
                  className="block text-base font-medium text-foreground hover:text-primary transition-colors py-1.5"
                  onClick={onClose}
                >
                  Schedule
                </Link>
                <Link 
                  to="/fields" 
                  className="block text-base font-medium text-foreground hover:text-primary transition-colors py-1.5"
                  onClick={onClose}
                >
                  Fields
                </Link>
                <Link 
                  to="/events" 
                  className="block text-base font-medium text-foreground hover:text-primary transition-colors py-1.5"
                  onClick={onClose}
                >
                  Events
                </Link>
              </CollapsibleContent>
            </Collapsible>

            {/* About CDBL */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-bold uppercase text-primary hover:text-primary/80 transition-colors group">
                <span>About CDBL</span>
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 space-y-2">
                <Link 
                  to="/new-to-cdbl" 
                  className="block text-base font-medium text-foreground hover:text-primary transition-colors py-1.5"
                  onClick={onClose}
                >
                  New to CDBL?
                </Link>
                <Link 
                  to="/about" 
                  className="block text-base font-medium text-foreground hover:text-primary transition-colors py-1.5"
                  onClick={onClose}
                >
                  About
                </Link>
                <Link 
                  to="/rules" 
                  className="block text-base font-medium text-foreground hover:text-primary transition-colors py-1.5"
                  onClick={onClose}
                >
                  Rules
                </Link>
                <Link 
                  to="/board" 
                  className="block text-base font-medium text-foreground hover:text-primary transition-colors py-1.5"
                  onClick={onClose}
                >
                  Board
                </Link>
                <Link 
                  to="/sponsors" 
                  className="block text-base font-medium text-foreground hover:text-primary transition-colors py-1.5"
                  onClick={onClose}
                >
                  Sponsors
                </Link>
              </CollapsibleContent>
            </Collapsible>

            {/* Get Involved */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-bold uppercase text-primary hover:text-primary/80 transition-colors group">
                <span>Get Involved</span>
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 space-y-2">
                <Link 
                  to="/volunteer" 
                  className="block text-base font-medium text-foreground hover:text-primary transition-colors py-1.5"
                  onClick={onClose}
                >
                  Volunteer
                </Link>
                <Link 
                  to="/contact" 
                  className="block text-base font-medium text-foreground hover:text-primary transition-colors py-1.5"
                  onClick={onClose}
                >
                  Contact
                </Link>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>
    </>
  );
};

export default NavigationTray;
