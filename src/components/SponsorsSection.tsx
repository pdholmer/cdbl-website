import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import ScrollIndicator from "@/components/ScrollIndicator";

const SponsorsSection = () => {
  // Placeholder for sponsor logos - these would be replaced with actual sponsor images
  const sponsors = [
    { name: "Sponsor 1", placeholder: true },
    { name: "Sponsor 2", placeholder: true },
    { name: "Sponsor 3", placeholder: true },
    { name: "Sponsor 4", placeholder: true },
    { name: "Sponsor 5", placeholder: true },
    { name: "Sponsor 6", placeholder: true },
  ];

  return (
    <section id="sponsors" className="relative min-h-[calc(100vh-136px)] scroll-snap-align-start py-12 md:py-20 bg-gradient-to-b from-background to-muted/20 flex items-center">
      <div className="container">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-carolina/10 rounded-full mb-4">
            <Heart className="w-7 h-7 md:w-8 md:h-8 text-carolina" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
            Our Community Sponsors
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            We're grateful for the generous support of our local business partners who make CDBL possible
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          {sponsors.map((sponsor, index) => (
            <div 
              key={index} 
              className="bg-white p-6 md:p-8 rounded-lg border border-border hover:shadow-[var(--shadow-card)] hover:border-carolina/30 transition-all flex items-center justify-center min-h-[140px] md:min-h-[160px]"
            >
              <div className="text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl md:text-3xl font-bold text-muted-foreground">
                    {index + 1}
                  </span>
                </div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">
                  {sponsor.name}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center rounded-xl p-6 md:p-8 border-2 border-primary/20"
             style={{ background: 'var(--gradient-subtle)' }}>
          <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-primary">Interested in Sponsoring CDBL?</h3>
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground mb-4 md:mb-6 max-w-2xl mx-auto leading-relaxed">
            Help us continue providing exceptional baseball programs to our community. 
            Contact us to learn about sponsorship opportunities.
          </p>
          <a 
            href="#contact"
            className="inline-flex items-center text-sm md:text-base text-carolina font-semibold hover:underline transition-all"
          >
            Get in Touch →
          </a>
        </div>
      </div>
      <ScrollIndicator />
    </section>
  );
};

export default SponsorsSection;
