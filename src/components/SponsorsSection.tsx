import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";

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
    <section id="sponsors" className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Our Community Sponsors
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We're grateful for the generous support of our local business partners who make CDBL possible
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {sponsors.map((sponsor, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8 flex items-center justify-center min-h-[150px]">
                <div className="text-center">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl font-bold text-muted-foreground">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {sponsor.name}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center bg-primary/5 rounded-lg p-8 border border-primary/10">
          <h3 className="text-2xl font-bold mb-4">Interested in Sponsoring CDBL?</h3>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Help us continue providing exceptional baseball programs to our community. 
            Contact us to learn about sponsorship opportunities.
          </p>
          <a 
            href="#contact"
            className="inline-flex items-center text-primary font-semibold hover:underline"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </section>
  );
};

export default SponsorsSection;
