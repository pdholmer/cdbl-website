import { Heart } from "lucide-react";

const SponsorsSection = () => {
  return (
    <section id="sponsors" className="py-12 md:py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-carolina/10 rounded-full mb-4">
            <Heart className="w-7 h-7 md:w-8 md:h-8 text-carolina" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
            Support CDBL
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            Local business sponsors make CDBL possible. Join our community of supporters and help us continue providing exceptional youth baseball programs.
          </p>
        </div>

        <div className="max-w-2xl mx-auto text-center rounded-xl p-8 md:p-10 border-2 border-primary/20"
             style={{ background: 'var(--gradient-subtle)' }}>
          <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-primary">Become a Community Sponsor</h3>
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground mb-4 md:mb-6 max-w-xl mx-auto leading-relaxed">
            Partner with CDBL to put your brand in front of hundreds of local families while investing directly in youth development. Sponsorship packages available at all levels.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center text-sm md:text-base text-carolina font-semibold hover:underline transition-all"
          >
            Get in Touch →
          </a>
        </div>
      </div>
    </section>
  );
};

export default SponsorsSection;
