import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Trophy, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TravelSchedule = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section 
          className="relative py-16 md:py-24 text-primary-foreground overflow-hidden"
          style={{ 
            background: 'linear-gradient(135deg, hsl(215 100% 26%) 0%, hsl(201 63% 56%) 100%)'
          }}
        >
          <div className="container">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Travel Tournament Schedule</h1>
            <p className="text-xl mb-8 max-w-2xl">View tournament schedules and important dates for all Rockets travel teams.</p>
            <Button 
              size="lg" 
              variant="hero"
              onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2121019', '_blank')}
              className="bg-background text-foreground hover:bg-background/90"
            >
              View Full Schedule on SportsConnect <ExternalLink className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* Key Dates */}
        <section className="py-16 bg-background">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Important Dates - 2026 Season</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card>
                <CardHeader>
                  <Calendar className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Tryouts</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary mb-2">March 8-9, 2026</p>
                  <p className="text-muted-foreground">Team selection tryouts</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Calendar className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Team Announcements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary mb-2">March 10, 2026</p>
                  <p className="text-muted-foreground">Rosters finalized & announced</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Calendar className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Season Kickoff</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary mb-2">Late March 2026</p>
                  <p className="text-muted-foreground">Practices begin</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Calendar className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>First Tournament</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary mb-2">Early April 2026</p>
                  <p className="text-muted-foreground">Spring kickoff tournaments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Calendar className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>State Tournaments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary mb-2">July 2026</p>
                  <p className="text-muted-foreground">State championship events</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Calendar className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Season Finale</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary mb-2">August 2026</p>
                  <p className="text-muted-foreground">End-of-season tournaments</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Tournament Schedule Info */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Tournament Schedule Overview</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Complete tournament schedules will be posted on SportsConnect once finalized. Typical tournament commitments by age group are shown below.
            </p>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>8U & 10U Teams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Trophy className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold">Tournament Count</p>
                        <p className="text-muted-foreground">8-12 tournaments per season</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold">Season Length</p>
                        <p className="text-muted-foreground">March - July (5 months)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold">Typical Locations</p>
                        <p className="text-muted-foreground">Within 2-hour drive (some overnight)</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>12U & 14U Teams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Trophy className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold">Tournament Count</p>
                        <p className="text-muted-foreground">12-15 tournaments per season</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold">Season Length</p>
                        <p className="text-muted-foreground">March - August (6 months)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold">Typical Locations</p>
                        <p className="text-muted-foreground">Regional sites (most require overnight)</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Typical Tournament Format */}
        <section className="py-16 bg-background">
          <div className="container max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">What to Expect at Tournaments</h2>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekend Tournament Format</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">Friday Evening (some tournaments)</p>
                    <p className="text-muted-foreground">• Travel to tournament location</p>
                    <p className="text-muted-foreground">• Hotel check-in</p>
                    <p className="text-muted-foreground">• Team dinner (optional)</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Saturday</p>
                    <p className="text-muted-foreground">• 2-3 pool play games</p>
                    <p className="text-muted-foreground">• Games start as early as 8:00 AM</p>
                    <p className="text-muted-foreground">• Seeding determined by Saturday results</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Sunday</p>
                    <p className="text-muted-foreground">• Bracket play (single elimination)</p>
                    <p className="text-muted-foreground">• Championship games in afternoon</p>
                    <p className="text-muted-foreground">• Awards ceremony</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Practice Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• 2-3 weeknight practices per week (March-August)</li>
                    <li>• Practice times typically 6:00-8:00 PM</li>
                    <li>• Additional optional hitting/pitching clinics</li>
                    <li>• Pre-tournament practice on Thursdays or Fridays</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Travel Expectations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Most tournaments require hotel stays (1-2 nights)</li>
                    <li>• Families responsible for own travel and accommodations</li>
                    <li>• Team often stays at same hotel for bonding</li>
                    <li>• Tournament entry fees included in registration</li>
                    <li>• Typical weekend cost: $150-$300 (hotel, meals, gas)</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">View Your Team Schedule</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Once teams are formed, you can view your team's complete tournament schedule, game results, and standings on SportsConnect.
            </p>
            <Button 
              variant="default" 
              size="lg"
              onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2121019', '_blank')}
              className="bg-white text-primary hover:bg-white/90 shadow-lg font-semibold"
            >
              Access SportsConnect <ExternalLink className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TravelSchedule;