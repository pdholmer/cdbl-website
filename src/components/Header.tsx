import cdblLogo from "@/assets/cdbl-logo.png";
import { Button } from "@/components/ui/button";

const Header = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={cdblLogo} 
            alt="CDBL Logo" 
            className="h-16 w-auto"
          />
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-semibold text-muted-foreground">Home of the</span>
            <span className="text-lg font-bold text-primary">ROCKETS</span>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <button 
            onClick={() => scrollToSection("about")}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            About
          </button>
          <button 
            onClick={() => scrollToSection("registration")}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Registration
          </button>
          <button 
            onClick={() => scrollToSection("spirit-wear")}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Spirit Wear
          </button>
          <button 
            onClick={() => scrollToSection("umpires")}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Umpires
          </button>
          <button 
            onClick={() => scrollToSection("sponsors")}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Sponsors
          </button>
        </nav>

        <Button 
          variant="hero" 
          size="lg"
          onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2121019', '_blank')}
        >
          Register Now
        </Button>
      </div>
    </header>
  );
};

export default Header;
