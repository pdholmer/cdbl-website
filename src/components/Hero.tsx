import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import heroFindProgram from "@/assets/hero-find-program.jpg";
import heroRegistration from "@/assets/hero-registration.jpg";
import heroSchedule from "@/assets/hero-schedule.jpg";
import heroShopGear from "@/assets/hero-shop-gear.jpg";
import heroVolunteer from "@/assets/hero-volunteer.jpg";

const carouselSlides = [
  {
    title: "Find Your Program",
    subtitle: "In-House MLB teams or Travel Rockets - Choose your path",
    primaryCta: { text: "In-House Baseball", link: "/in-house" },
    secondaryCta: { text: "Travel Teams", link: "/travel" },
    image: heroFindProgram
  },
  {
    title: "2026 Registration",
    subtitle: "Join CDBL - 38 Years of Youth Baseball Excellence",
    primaryCta: { text: "Register Now", link: "/registration" },
    secondaryCta: { text: "View Programs", link: "/teams" },
    image: heroRegistration
  },
  {
    title: "Game Schedule",
    subtitle: "Find game times, field locations, and more",
    primaryCta: { text: "View Schedule", link: "/schedule" },
    secondaryCta: { text: "Find Fields", link: "/fields" },
    image: heroSchedule
  },
  {
    title: "Shop Rockets Gear",
    subtitle: "Official CDBL merchandise and team spirit wear",
    primaryCta: { text: "Shop Now", link: "/shop" },
    secondaryCta: { text: "View Events", link: "/events" },
    image: heroShopGear
  },
  {
    title: "Volunteer With Us",
    subtitle: "Make a difference in youth baseball today",
    primaryCta: { text: "Get Involved", link: "/volunteer" },
    secondaryCta: { text: "Learn More", link: "/about" },
    image: heroVolunteer
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
              <section 
                className="relative py-16 md:py-24 text-primary-foreground overflow-hidden bg-cover bg-center sm:bg-center md:bg-[65%_center]"
                style={{ 
                  backgroundImage: `linear-gradient(to right, hsla(215, 100%, 26%, 0.9) 0%, hsla(201, 63%, 56%, 0.1) 100%), url('${slide.image}')`,
                }}
              >
                <div className="container relative z-10">
                  <div className="max-w-3xl">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight line-clamp-1">
                      {slide.title}
                    </h1>
                    
                    <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 leading-relaxed opacity-95 line-clamp-2">
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
