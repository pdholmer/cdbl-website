import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-baseball.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
      </div>
      
      <div className="container relative z-10 py-20">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Central District Baseball League
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
            For 38 years, CDBL has been a non-profit youth baseball organization dedicated to serving the community... to foster the love of the game and have fun while doing it.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2121019', '_blank')}
            >
              Register for Travel Baseball
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm"
              onClick={() => {
                const element = document.getElementById("about");
                element?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
