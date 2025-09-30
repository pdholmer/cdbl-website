import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import heroImage from "@/assets/hero-baseball.jpg";
import playerPitching from "@/assets/player-pitching.jpg";
import slidingAction from "@/assets/sliding-action.jpg";
import crowdSpirit from "@/assets/crowd-spirit.jpg";

const carouselSlides = [
  {
    image: heroImage,
    title: "Where Champions Are Made",
    subtitle: "Join Central District Baseball League - 38 Years of Excellence"
  },
  {
    image: playerPitching,
    title: "Travel & Rec Baseball",
    subtitle: "Expert coaching for all skill levels since 1987"
  },
  {
    image: slidingAction,
    title: "Play Hard, Have Fun",
    subtitle: "Building character through America's favorite pastime"
  },
  {
    image: crowdSpirit,
    title: "Join Our Community",
    subtitle: "Non-profit organization dedicated to youth development"
  }
];

const Hero = () => {
  return (
    <section className="relative min-h-[500px] md:min-h-[600px] overflow-hidden">
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
          {carouselSlides.map((slide, index) => (
            <CarouselItem key={index} className="h-full">
              <div className="relative min-h-[500px] md:min-h-[600px] flex items-center justify-center">
                <div 
                  className="absolute inset-0 bg-cover bg-center aspect-square md:aspect-auto"
                  style={{ backgroundImage: `url(${slide.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/45" />
                </div>
                
                <div className="container relative z-10 py-8 md:py-16">
                  <div className="max-w-2xl">
                    <div className="inline-block bg-primary/20 backdrop-blur-sm border border-primary/30 text-primary-foreground px-3 py-1.5 rounded-full mb-3 text-xs md:text-sm font-semibold">
                      38 Years of Excellence
                    </div>
                    
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4 leading-tight animate-fade-in">
                      {slide.title}
                    </h1>
                    
                    <p className="text-base md:text-xl text-white/90 mb-6 md:mb-8 leading-relaxed">
                      {slide.subtitle}
                    </p>

                    <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                      <Button 
                        variant="hero" 
                        size="lg"
                        onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2121019', '_blank')}
                      >
                        Register Now
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm"
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
