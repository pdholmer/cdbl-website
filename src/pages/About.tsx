import cdblSeal from "@/assets/cdbl-seal.png";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Heart, Users, Target } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary-light py-20 text-primary-foreground">
          <div className="container">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">About CDBL</h1>
            <p className="text-xl max-w-2xl">38 years of building character, skills, and community through youth baseball.</p>
          </div>
        </section>

        {/* Mission & History */}
        <section className="py-20 bg-background">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Mission</h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  The Central District Baseball League has proudly served Burlington, IL and the surrounding community since 1987. As a non-profit organization, we're committed to providing exceptional youth baseball programs that emphasize skill development, teamwork, sportsmanship, and the pure joy of the game.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Our mission is simple: foster a love of baseball while creating lasting memories and friendships. Whether your child is just starting out or looking to take their game to the next level with our Travel teams, CDBL offers programs designed to help every player succeed both on and off the field.
                </p>
              </div>
              <div className="flex justify-center">
                <img 
                  src={cdblSeal} 
                  alt="CDBL Seal" 
                  className="w-full max-w-md h-auto drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-16 bg-muted/30">
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
                    We strive for excellence in every aspect of our program, from coaching to facilities to player development.
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
                    We're more than a league—we're a family. CDBL brings together players, families, and the community.
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
          </div>
        </section>

        {/* History Timeline */}
        <section className="py-16 bg-background">
          <div className="container max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Our History</h2>
            
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-24 text-2xl font-bold text-primary">1987</div>
                <div className="flex-1 pb-8 border-l-2 border-border pl-6">
                  <h3 className="text-xl font-bold mb-2">CDBL Founded</h3>
                  <p className="text-muted-foreground">
                    The Central District Baseball League was established by a group of dedicated parents and coaches who wanted to provide quality youth baseball to Burlington and surrounding communities.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-24 text-2xl font-bold text-primary">1995</div>
                <div className="flex-1 pb-8 border-l-2 border-border pl-6">
                  <h3 className="text-xl font-bold mb-2">Main Complex Opens</h3>
                  <p className="text-muted-foreground">
                    After years of fundraising and community support, CDBL opened its first dedicated baseball complex with four regulation fields.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-24 text-2xl font-bold text-primary">2003</div>
                <div className="flex-1 pb-8 border-l-2 border-border pl-6">
                  <h3 className="text-xl font-bold mb-2">Travel Program Begins</h3>
                  <p className="text-muted-foreground">
                    CDBL launched its competitive travel program, the Rockets, to provide advanced opportunities for elite players.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-24 text-2xl font-bold text-primary">2015</div>
                <div className="flex-1 pb-8 border-l-2 border-border pl-6">
                  <h3 className="text-xl font-bold mb-2">Lighting Upgrade</h3>
                  <p className="text-muted-foreground">
                    Professional lighting systems installed on three fields, allowing for evening games and expanded scheduling.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-24 text-2xl font-bold text-primary">2025</div>
                <div className="flex-1 pl-6">
                  <h3 className="text-xl font-bold mb-2">38 Years Strong</h3>
                  <p className="text-muted-foreground">
                    Today, CDBL serves over 400 players annually across In-House and Travel programs, maintaining our commitment to excellence and community.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* By The Numbers */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">CDBL By The Numbers</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-primary mb-2">38</div>
                <p className="text-muted-foreground font-semibold">Years of Service</p>
              </div>
              
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-primary mb-2">400+</div>
                <p className="text-muted-foreground font-semibold">Players Annually</p>
              </div>
              
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-primary mb-2">50+</div>
                <p className="text-muted-foreground font-semibold">Teams</p>
              </div>
              
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-primary mb-2">100+</div>
                <p className="text-muted-foreground font-semibold">Volunteers</p>
              </div>
            </div>
          </div>
        </section>

        {/* Board Members */}
        <section className="py-16 bg-background">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Board of Directors</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>John Smith</CardTitle>
                  <p className="text-sm text-primary font-semibold">President</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    CDBL parent for 8 years. Background in youth sports administration.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Lisa Davis</CardTitle>
                  <p className="text-sm text-primary font-semibold">Vice President</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Former college softball player. Passionate about youth athletics and education.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sarah Johnson</CardTitle>
                  <p className="text-sm text-primary font-semibold">Treasurer</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    CPA with 15 years experience. Joined CDBL board in 2025.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mike Chen</CardTitle>
                  <p className="text-sm text-primary font-semibold">Player Agent</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    High school baseball coach. CDBL coach for 10+ years.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dave Martinez</CardTitle>
                  <p className="text-sm text-primary font-semibold">Travel Coordinator</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Former minor league player. Leads our competitive travel program.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Amy Wilson</CardTitle>
                  <p className="text-sm text-primary font-semibold">Sponsorship Director</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Marketing professional. Builds relationships with local businesses.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;