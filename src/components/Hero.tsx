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
    <section className="relative overflow-hidden">
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
              <section className="bg-gradient-to-br from-primary to-primary-light py-20 text-primary-foreground">
                <div className="container">
                  <div className="max-w-2xl">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                      {slide.title}
                    </h1>
                    
                    <p className="text-xl mb-8">
                      {slide.subtitle}
                    </p>

                    <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                      <Button 
                        variant="hero" 
                        size="lg"
                        asChild
                        className="bg-background text-foreground hover:bg-background/90"
                      >
                        <Link to={slide.primaryCta.link}>{slide.primaryCta.text}</Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg"
                        asChild
                        className="border-primary-foreground/30 hover:bg-primary-foreground/10"
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
