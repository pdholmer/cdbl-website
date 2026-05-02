import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import cdblSeal from "@/assets/cdbl-seal.png";

const AboutSection = () => {
  return (
    <section id="about" className="py-12 md:py-16 bg-background">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
              Welcome to CDBL
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mb-4 leading-relaxed">
              The Central District Baseball League has proudly served Burlington & Plato Center, IL for over three decades — a 501(c)(3) non-profit committed to skill development, teamwork, and the pure joy of baseball.
            </p>
            <p className="text-base md:text-lg text-muted-foreground mb-6 leading-relaxed">
              Whether your child is just starting out or ready to compete at the travel level, CDBL has a program built for every player.
            </p>
            <Button asChild variant="default" size="lg">
              <Link to="/about">Learn More About CDBL →</Link>
            </Button>
          </div>
          <div className="flex justify-center">
            <img
              src={cdblSeal}
              alt="CDBL Seal - Excellence in Youth Baseball"
              className="w-full max-w-sm md:max-w-md h-auto drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Narrative stat */}
        <div className="mt-12 md:mt-16 max-w-3xl">
          <p className="text-2xl md:text-3xl lg:text-4xl font-heading font-medium leading-tight">
            Since 1987, more than <span className="text-primary font-bold">400 players</span>,
            <span className="text-primary font-bold"> 50 teams</span>, and
            <span className="text-primary font-bold"> 100 volunteers</span> have
            built CDBL into Burlington's home for youth baseball.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
