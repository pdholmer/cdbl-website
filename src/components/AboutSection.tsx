import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import cdblSeal from "@/assets/cdbl-seal.png";

const stats = [
  { value: "38", label: "Years" },
  { value: "400+", label: "Players" },
  { value: "50+", label: "Teams" },
  { value: "100+", label: "Volunteers" },
];

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

        {/* Stat strip */}
        <div className="mt-10 md:mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-4 rounded-xl border border-border bg-card">
              <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
