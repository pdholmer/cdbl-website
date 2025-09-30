import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Check } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import heroImage from "@/assets/hero-baseball.jpg";
import playerPitching from "@/assets/player-pitching.jpg";
import slidingAction from "@/assets/sliding-action.jpg";
import crowdSpirit from "@/assets/crowd-spirit.jpg";

const carouselImages = [
  heroImage,
  playerPitching,
  slidingAction,
  crowdSpirit
];

const Hero = () => {
  return (
    <section className="relative min-h-[600px] overflow-hidden">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 4500,
          }),
        ]}
        className="w-full h-full"
      >
        <CarouselContent className="h-full">
          {carouselImages.map((image, index) => (
            <CarouselItem key={index} className="h-full">
              <div className="relative min-h-[600px] md:min-h-[650px] flex items-center justify-center">
                <div 
                  className="absolute inset-0 bg-cover bg-center aspect-square md:aspect-auto"
                  style={{ backgroundImage: `url(${image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/45" />
                </div>
                
                <div className="container relative z-10 py-12 md:py-20">
                  <div className="max-w-3xl">
                    <div className="inline-block bg-primary/20 backdrop-blur-sm border border-primary/30 text-primary-foreground px-4 py-2 rounded-full mb-4 text-sm font-semibold">
                      38 Years of Excellence • Since 1987
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight animate-fade-in">
                      Central District Baseball League
                    </h1>
                    
                    <p className="text-lg md:text-xl text-white/90 mb-6 leading-relaxed">
                      Building character, skills, and community through America's favorite pastime
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 text-white/95">
                      <div className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm md:text-base">Travel & Rec Leagues for All Skill Levels</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm md:text-base">Expert Coaching & Character Development</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm md:text-base">Flexible Scheduling for Busy Families</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm md:text-base">Non-Profit Community Organization</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                      <Button 
                        variant="hero" 
                        size="lg"
                        className="text-base md:text-lg"
                        onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2121019', '_blank')}
                      >
                        Register Now - 2026 Season
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm text-base md:text-lg"
                        onClick={() => {
                          const element = document.getElementById("registration");
                          element?.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        View Programs
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
};

export default Hero;
