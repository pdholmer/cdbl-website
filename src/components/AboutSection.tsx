import cdblSeal from "@/assets/cdbl-seal.png";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Heart, Users, Target } from "lucide-react";

const AboutSection = () => {
  return (
    <>
      <section id="about" className="py-20 bg-muted/30">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Welcome to CDBL
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                The Central District Baseball League has proudly served Burlington, IL and the surrounding community for over three decades. As a 501(c)(3) non-profit organization, we're committed to providing exceptional youth baseball programs that emphasize skill development, teamwork, and the pure joy of the game.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our mission is simple: foster a love of baseball while creating lasting memories and friendships. Whether your child is just starting out or looking to take their game to the next level with our Travel teams, CDBL offers programs designed to help every player succeed.
              </p>
            </div>
            <div className="flex justify-center">
              <img 
                src={cdblSeal} 
                alt="CDBL Seal - Excellence in Youth Baseball" 
                className="w-full max-w-md h-auto drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-background">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Our Core Values</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <Trophy className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We strive for excellence in every aspect, from coaching to facilities to player development.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Heart className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Integrity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We teach players the importance of honesty, respect, and playing the game the right way.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We're more than a league—we're a family bringing together players, families, and community.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Target className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Development</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Every player improves. We focus on teaching fundamental skills and a love for the game.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Safety Highlight */}
          <div className="mt-12 p-6 bg-primary/10 rounded-lg max-w-3xl mx-auto">
            <h3 className="text-xl font-bold mb-3 text-center">Safety First</h3>
            <p className="text-muted-foreground text-center mb-4">
              Player safety is our top priority. All CDBL programs follow strict safety guidelines:
            </p>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Helmets with face guards required (ages 4-12)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Catchers gear provided by league</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Pitch count limits enforced</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>No metal cleats under age 13</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Athletic cups required for catchers</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">✓</span>
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
