import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const carouselSlides = [
  {
    title: "Register for 2026 Season",
    subtitle: "Join Central District Baseball League - 38 Years of Excellence",
    primaryCta: { text: "Register Now", link: "/registration" },
    secondaryCta: { text: "View Programs", link: "/teams" }
  },
  {
    title: "Check Game Schedule",
    subtitle: "Find game times, field locations, and important dates",
    primaryCta: { text: "View Schedule", link: "/schedule" },
    secondaryCta: { text: "Find Fields", link: "/fields" }
  },
  {
    title: "Shop Rockets Gear",
    subtitle: "Show your team spirit with official CDBL merchandise",
    primaryCta: { text: "Shop Now", link: "/shop" },
    secondaryCta: { text: "View Events", link: "/events" }
  },
  {
    title: "Volunteer Today",
    subtitle: "Help make a difference in our community through youth baseball",
    primaryCta: { text: "Get Involved", link: "/volunteer" },
    secondaryCta: { text: "Learn More", link: "/about" }
  }
];

const Hero = () => {
  return (
    <section className="relative overflow-hidden hero-viewport">
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
              <section 
                className="relative h-full flex items-center text-primary-foreground overflow-hidden"
                style={{ background: 'var(--gradient-hero)' }}
              >
                <div className="container relative z-10">
                  <div className="max-w-3xl">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
                      {slide.title}
                    </h1>
                    
                    <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 leading-relaxed opacity-95">
                      {slide.subtitle}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                      <Button 
                        variant="default" 
                        size="lg"
                        asChild
                        className="bg-white text-primary hover:bg-white/90 shadow-lg font-semibold"
                      >
                        <Link to={slide.primaryCta.link}>{slide.primaryCta.text}</Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg"
                        asChild
                        className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-carolina hover:border-white font-semibold"
                      >
                        <Link to={slide.secondaryCta.link}>{slide.secondaryCta.text}</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
};

export default Hero;
