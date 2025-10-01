import { Link } from "react-router-dom";
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
    title: "Register for 2026 Season",
    subtitle: "Join Central District Baseball League - 38 Years of Excellence",
    primaryCta: { text: "Register Now", link: "/registration" },
    secondaryCta: { text: "View Programs", link: "/teams" }
  },
  {
    image: playerPitching,
    title: "Check Game Schedule",
    subtitle: "Find game times, field locations, and important dates",
    primaryCta: { text: "View Schedule", link: "/schedule" },
    secondaryCta: { text: "Find Fields", link: "/fields" }
  },
  {
    image: slidingAction,
    title: "Shop Rockets Gear",
    subtitle: "Show your team spirit with official CDBL merchandise",
    primaryCta: { text: "Shop Now", link: "/shop" },
    secondaryCta: { text: "View Events", link: "/events" }
  },
  {
    image: crowdSpirit,
    title: "Volunteer Today",
    subtitle: "Help make a difference in our community through youth baseball",
    primaryCta: { text: "Get Involved", link: "/volunteer" },
    secondaryCta: { text: "Learn More", link: "/about" }
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
                        asChild
                      >
                        <Link to={slide.primaryCta.link}>{slide.primaryCta.text}</Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm"
                        asChild
                      >
                        <Link to={slide.secondaryCta.link}>{slide.secondaryCta.text}</Link>
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
