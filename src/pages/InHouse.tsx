import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { CircleDot, Users, Trophy, DollarSign, Calendar, Heart, ClipboardList, BookOpen } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import heroInhouse from "@/assets/hero-inhouse.jpg";
import { usePrograms } from "@/hooks/usePrograms";
import { Skeleton } from "@/components/ui/skeleton";

const InHouse = () => {
  const { inHouseProgram, inHouseDivisions, isLoading } = usePrograms();

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section 
          className="relative py-16 md:py-24 text-primary-foreground overflow-hidden bg-cover bg-center sm:bg-center md:bg-[65%_center]"
          style={{ 
            backgroundImage: `linear-gradient(to right, hsla(215, 100%, 26%, 0.9) 0%, hsla(201, 63%, 56%, 0.1) 100%), url('${heroInhouse}')`
          }}
        >
          <div className="container relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
                In-House Baseball Program
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 leading-relaxed opacity-95">
                Where every child plays, learns, and loves the game. Recreational baseball for ages 4-14 using MLB team names.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Button 
                  variant="default" 
                  size="lg"
                  asChild
                  className="bg-white text-primary hover:bg-white/90 shadow-lg font-semibold"
                >
                  <a href="https://registration.bluesombrero.com/84830/program-questions/preview/80130405" target="_blank" rel="noopener noreferrer">Register Now</a>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  asChild
                  className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-carolina hover:border-white font-semibold"
                >
                  <Link to="/teams#in-house">View Teams</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Sub-page Navigation Grid */}
        <section className="py-10 bg-muted/50 border-b">
          <div className="container">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">Explore the Program</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { to: "/in-house/teams", icon: Users, label: "Teams & Divisions", desc: "See all divisions and meet your team" },
                { to: "/in-house/registration", icon: ClipboardList, label: "Registration", desc: "Register your player for 2026" },
                { to: "/in-house/schedule", icon: Calendar, label: "Schedule", desc: "View game dates and times" },
                { to: "/in-house/rules", icon: BookOpen, label: "Rules & FAQ", desc: "Division rules and common questions" },
              ].map(({ to, icon: Icon, label, desc }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex flex-col gap-2 p-4 rounded-lg border bg-card text-card-foreground shadow-sm hover:border-primary hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-semibold text-sm leading-tight">{label}</span>
                  <span className="text-xs text-muted-foreground leading-snug">{desc}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose In-House Section */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Why Choose In-House Baseball?</h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">All Skill Levels Welcome</h3>
                <p className="text-muted-foreground">
                  No tryouts required. Every child who registers gets to play. Balanced teams ensure competitive, fun games for all abilities.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Affordable Family Fun</h3>
                <p className="text-muted-foreground">
                  Registration from just $195-$335 includes jersey, hat, and full season. Sibling discounts and scholarships available.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Focus on Fundamentals</h3>
                <p className="text-muted-foreground">
                  Learn proper throwing, hitting, and fielding techniques in a supportive environment. Build lifelong skills and love for the game.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Local & Convenient</h3>
                <p className="text-muted-foreground">
                  All games at CDBL fields. Weeknight and Saturday games fit family schedules. Season runs April through June/July.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Team Spirit</h3>
                <p className="text-muted-foreground">
                  Build friendships, sportsmanship, and teamwork. End-of-season tournaments and celebrations for all divisions.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  <CircleDot className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">MLB Pride</h3>
                <p className="text-muted-foreground">
                  Wear the colors and names of Major League teams. Foster connection to professional baseball and hometown pride.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Season Overview */}
        <section className="py-16 bg-background">
          <div className="container max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">What to Expect</h2>
            
            <div className="space-y-6">
              {isLoading ? (
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Season Structure</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {inHouseProgram?.season_start && (
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="font-semibold">Season Dates</span>
                        <span className="text-muted-foreground">
                          {new Date(inHouseProgram.season_start).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - {new Date(inHouseProgram.season_end || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                    )}
                    {inHouseDivisions?.[0]?.season_length && (
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="font-semibold">Season Length</span>
                        <span className="text-muted-foreground">{inHouseDivisions[0].season_length}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="font-semibold">Practices</span>
                      <span className="text-muted-foreground">1-2 per week</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Time Commitment</span>
                      <span className="text-muted-foreground">3-5 hours per week</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>What's Included</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>✓ Official CDBL jersey with MLB team name</li>
                    <li>✓ Team hat matching MLB colors</li>
                    <li>✓ Full season of games and practices</li>
                    <li>✓ Experienced volunteer coaches</li>
                    <li>✓ End-of-season tournament</li>
                    <li>✓ Individual and team awards</li>
                    <li>✓ Access to all CDBL facilities</li>
                  </ul>
                </CardContent>
              </Card>

              {isLoading ? (
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Registration Fees</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Mobile: card stack; Desktop: horizontal rows */}
                    <div className="grid grid-cols-1 gap-3 md:gap-0 md:space-y-2">
                      {inHouseDivisions?.map((division) => (
                        <div
                          key={division.id}
                          className="flex flex-col gap-1 rounded-lg border p-3 md:flex-row md:justify-between md:items-center md:rounded-none md:border-0 md:border-b md:last:border-0 md:p-0 md:pb-2"
                        >
                          <div>
                            <span className="font-semibold block md:inline">{division.name}</span>
                            <span className="text-sm text-muted-foreground md:ml-1">Ages {division.age_range}</span>
                          </div>
                          <span className="font-bold text-primary text-lg md:text-base">
                            {division.cost != null ? `$${division.cost}` : 'TBD — Contact registrar@cdbaseball.org'}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      Family discounts and financial assistance available.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="mt-12 text-center">
              <Button size="lg" variant="hero" asChild>
                <Link to="/registration">Register for In-House Baseball</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Play Ball?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join hundreds of families in the CDBL in-house program. Registration is open now for the 2026 season!
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                variant="default" 
                size="lg"
                asChild
                className="bg-white text-primary hover:bg-white/90 shadow-lg font-semibold"
              >
                <Link to="/registration">Register Today</Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                asChild
                className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-carolina hover:border-white font-semibold"
              >
                <Link to="/new-to-cdbl">New to CDBL?</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default InHouse;