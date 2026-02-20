import cdblSeal from "@/assets/cdbl-seal.png";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Heart, Users, Target } from "lucide-react";

const AboutSection = () => {
  return (
    <>
      <section id="about" className="py-12 md:py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
                Welcome to CDBL
              </h2>
              <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                The Central District Baseball League has proudly served Burlington & Plato Center, IL and the surrounding community for over three decades. As a 501(c)(3) non-profit organization, we're committed to providing exceptional youth baseball programs that emphasize skill development, teamwork, and the pure joy of the game.
              </p>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Our mission is simple: foster a love of baseball while creating lasting memories and friendships. Whether your child is just starting out or looking to take their game to the next level with our Travel teams, CDBL offers programs designed to help every player succeed.
              </p>
            </div>
            <div className="flex justify-center">
              <img 
                src={cdblSeal} 
                alt="CDBL Seal - Excellence in Youth Baseball" 
                className="w-full max-w-sm md:max-w-md h-auto drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values - No Cards, Direct Content */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8 md:mb-12 text-center">Our Core Values</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-carolina/10 to-carolina/5 border border-carolina/20 hover:shadow-[var(--shadow-carolina)] transition-all">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-carolina rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-7 w-7 md:h-8 md:w-8 text-carolina-foreground" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2">Excellence</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                We strive for excellence in every aspect, from coaching to facilities to player development.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:shadow-[var(--shadow-strong)] transition-all">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-7 w-7 md:h-8 md:w-8 text-primary-foreground" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2">Integrity</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                We teach players the importance of honesty, respect, and playing the game the right way.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-carolina/10 to-carolina/5 border border-carolina/20 hover:shadow-[var(--shadow-carolina)] transition-all">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-carolina rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-7 w-7 md:h-8 md:w-8 text-carolina-foreground" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2">Community</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                We're more than a league—we're a family bringing together players, families, and community.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:shadow-[var(--shadow-strong)] transition-all">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-7 w-7 md:h-8 md:w-8 text-primary-foreground" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2">Development</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Every player improves. We focus on teaching fundamental skills and a love for the game.
              </p>
            </div>
          </div>

          {/* Safety Highlight */}
          <div className="mt-8 md:mt-12 p-6 md:p-8 rounded-xl max-w-4xl mx-auto border-2 border-carolina/30"
               style={{ background: 'var(--gradient-subtle)' }}>
            <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-center text-carolina">Safety First</h3>
            <p className="text-sm md:text-base text-muted-foreground text-center mb-4 md:mb-6 max-w-2xl mx-auto">
              Player safety is our top priority. All CDBL programs follow strict safety guidelines:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 md:gap-4 text-sm md:text-base">
              <div className="flex items-start gap-2 md:gap-3">
                <span className="text-carolina text-lg md:text-xl font-bold">✓</span>
                <span>Helmets with face guards required (ages 4-12)</span>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <span className="text-carolina text-lg md:text-xl font-bold">✓</span>
                <span>Catchers gear provided by league</span>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <span className="text-carolina text-lg md:text-xl font-bold">✓</span>
                <span>Pitch count limits enforced</span>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <span className="text-carolina text-lg md:text-xl font-bold">✓</span>
                <span>No metal cleats under age 13</span>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <span className="text-carolina text-lg md:text-xl font-bold">✓</span>
                <span>Athletic cups required for catchers</span>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <span className="text-carolina text-lg md:text-xl font-bold">✓</span>
                <span>Background checks for all coaches</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutSection;
