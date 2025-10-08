import { ChevronsDown } from "lucide-react";

const ScrollIndicator = () => {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
      <ChevronsDown 
        className="w-5 h-5 md:w-6 md:h-6 text-foreground/20 animate-scroll-hint" 
        aria-hidden="true"
      />
    </div>
  );
};

export default ScrollIndicator;
