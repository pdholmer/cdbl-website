import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

import heroSchedule from "@/assets/hero-schedule.jpg";
import heroNewToCdbl from "@/assets/hero-new-to-cdbl.jpg";

const carouselSlides = [
  {
    title: "New to CDBL?",
    subtitle: "Learn about our programs and join Burlington's baseball community.",
    subtitle2: "Your complete guide to CDBL — from programs to game day.",
    primaryCta: { text: "Start Here", link: "/new-to-cdbl" },
    secondaryCta: { text: "View Programs", link: "/teams" },
    image: heroNewToCdbl,
  },
  {
    title: "2026 Season Underway",
    subtitle: "38 years of youth baseball excellence in Burlington & Plato Center.",
    subtitle2: "Check the schedule for upcoming games and find your field.",
    primaryCta: { text: "View Schedule", link: "/schedule" },
    secondaryCta: { text: "View Teams", link: "/teams" },
    image: heroSchedule,
  },
];

const Hero = () => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const plugin = React.useRef(
    Autoplay({ delay: 4500, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  return (
    <section className="relative overflow-hidden">
      <Carousel
        setApi={setApi}
        opts={{ align: "start", loop: true }}
        plugins={[plugin.current]}
        className="w-full"
      >
        <CarouselContent>
          {carouselSlides.map((slide, index) => (
            <CarouselItem key={index}>
              <section
                className="relative min-h-[320px] sm:min-h-[360px] md:min-h-[420px] lg:min-h-[480px] py-16 md:py-24 text-primary-foreground overflow-hidden bg-cover bg-center sm:bg-center md:bg-[65%_center] flex items-center"
                style={{
                  backgroundImage: `linear-gradient(to right, hsla(215, 100%, 26%, 0.9) 0%, hsla(201, 63%, 56%, 0.1) 100%), url('${slide.image}')`,
                }}
              >
                <div className="container relative z-10">
                  <div className="max-w-3xl">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight line-clamp-1">
                      {slide.title}
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl mb-1 leading-relaxed opacity-95">
                      {slide.subtitle}
                    </p>
                    <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 leading-relaxed opacity-80 italic">
                      {slide.subtitle2}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                      <Button
                        variant="default"
                        size="lg"
                        asChild
                        className="bg-white text-primary hover:bg-white/90 shadow-lg font-semibold text-base px-6 py-3"
                      >
                        <Link to={slide.primaryCta.link}>{slide.primaryCta.text}</Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        asChild
                        className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-carolina hover:border-white font-semibold text-base px-6 py-3"
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

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {carouselSlides.map((_, index) => (
          <button
            key={index}
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => api?.scrollTo(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              current === index ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
