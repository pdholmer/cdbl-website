import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { CircleDot, Users, Trophy, DollarSign, Calendar, Heart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const InHouse = () => {
  const divisions = [
    { name: "T-Ball", ages: "4-6", color: "hsl(0 84% 60%)", team: "Cardinals" },
    { name: "Pinto", ages: "7-8", color: "hsl(201 63% 56%)", team: "Cubs" },
    { name: "Bronco", ages: "9-10", color: "hsl(215 100% 26%)", team: "Dodgers" },
    { name: "Pony", ages: "11-12", color: "hsl(24 100% 50%)", team: "Giants" },
    { name: "Colt", ages: "13-14", color: "hsl(142 76% 36%)", team: "Athletics" },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section 
          className="relative py-16 md:py-24 text-primary-foreground overflow-hidden"
          style={{ background: 'var(--gradient-hero)' }}
        >
          <div className="container">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">In-House Baseball Program</h1>
            <p className="text-xl mb-8 max-w-2xl">Where every child plays, learns, and loves the game. Recreational baseball for ages 4-14 using MLB team names.</p>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                variant="hero"
                asChild
                className="bg-background text-foreground hover:bg-background/90"
              >
                <Link to="/registration">Register Now</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                asChild
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <Link to="/teams#in-house">View Teams</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* MLB Team Identity Section */}
        <section className="py-16 bg-background">
          <div className="container">
            <div className="text-center mb-12">
              <CircleDot className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your MLB Team</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our in-house teams proudly wear the names of Major League Baseball teams. From the Cardinals to the Yankees, 
                every player gets to represent their favorite MLB franchise!
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
              {divisions.map((division) => (
                <Card key={division.name} className="text-center border-2" style={{ borderColor: division.color }}>
                  <CardHeader>
                    <div 
                      className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                      style={{ backgroundColor: division.color, opacity: 0.9 }}
                    >
                      <CircleDot className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle>{division.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">Ages {division.ages}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-semibold" style={{ color: division.color }}>
                      Example: {division.team}
                    </p>
                  </CardContent>
                </Card>
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
                  Registration from just $75-$155 includes jersey, hat, and full season. Sibling discounts and scholarships available.
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
              <Card>
                <CardHeader>
                  <CardTitle>Season Structure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="font-semibold">Season Dates</span>
                    <span className="text-muted-foreground">April - June/July 2026</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="font-semibold">Number of Games</span>
                    <span className="text-muted-foreground">12-18 games (varies by division)</span>
                  </div>
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

              <Card>
                <CardHeader>
                  <CardTitle>Registration Fees</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span>T-Ball (Ages 4-6)</span>
                      <span className="font-bold text-primary">$75</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span>Pinto (Ages 7-8)</span>
                      <span className="font-bold text-primary">$95</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span>Bronco (Ages 9-10)</span>
                      <span className="font-bold text-primary">$115</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span>Pony (Ages 11-12)</span>
                      <span className="font-bold text-primary">$135</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Colt (Ages 13-14)</span>
                      <span className="font-bold text-primary">$155</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Family discounts and financial assistance available.
                  </p>
                </CardContent>
              </Card>
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
                size="lg" 
                variant="hero"
                asChild
                className="bg-background text-foreground hover:bg-background/90"
              >
                <Link to="/registration">Register Today</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                asChild
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
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