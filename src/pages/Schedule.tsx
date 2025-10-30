import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
const Schedule = () => {
  return <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 text-primary-foreground overflow-hidden" style={{
        background: 'var(--gradient-hero)'
      }}>
          <div className="container">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">League Schedule & Calendar</h1>
            <p className="text-xl mb-8 max-w-2xl">View game schedules, practice times, and upcoming events for all CDBL teams.</p>
            <Button size="lg" variant="hero" onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2121019', '_blank')} className="bg-background text-foreground hover:bg-background/90">
              View Full Schedule on SportsConnect <ExternalLink className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* Key Dates Section */}
        <section className="py-16 bg-background">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Important Dates - 2026 Season</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card>
                <CardHeader>
                  <Calendar className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Registration Opens</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary mb-2">December 1, 2025</p>
                  <p className="text-muted-foreground">Early bird registration begins</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Calendar className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Player Evaluations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary mb-2">March 8-9, 2026</p>
                  <p className="text-muted-foreground">Skill assessments for team placement</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Calendar className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Draft Day</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary mb-2">March 15, 2026</p>
                  <p className="text-muted-foreground">Team rosters finalized</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Calendar className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Opening Day</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary mb-2">April 12, 2026</p>
                  <p className="text-muted-foreground">Season kicks off with ceremony</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Calendar className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>All-Star Game</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary mb-2">June 20, 2026</p>
                  <p className="text-muted-foreground">Annual all-star showcase</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Calendar className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Championship Day</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary mb-2">July 18, 2026</p>
                  <p className="text-muted-foreground">Season finale tournaments</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Game Schedule Info */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Game Schedules by Division</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Full game schedules will be posted on SportsConnect once teams are finalized. Typical game times by division are shown below.
            </p>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>T-Ball & Pinto (Ages 4-8)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold">Game Times</p>
                        <p className="text-muted-foreground">Weekdays: 6:00 PM - 7:30 PM</p>
                        <p className="text-muted-foreground">Saturdays: 9:00 AM - 12:00 PM</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold">Season Length</p>
                        <p className="text-muted-foreground">12-14 games (April - June)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold">Locations</p>
                        <p className="text-muted-foreground">CDBL Main Complex</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bronco & Pony (Ages 9-12)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold">Game Times</p>
                        <p className="text-muted-foreground">Weekdays: 6:00 PM - 8:00 PM</p>
                        <p className="text-muted-foreground">Saturdays: 9:00 AM - 3:00 PM</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold">Season Length</p>
                        <p className="text-muted-foreground">16-18 games (April - July)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold">Locations</p>
                        <p className="text-muted-foreground">CDBL Fields 1-4</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Colt (Ages 13-14)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold">Game Times</p>
                        <p className="text-muted-foreground">Weekdays: 6:30 PM - 9:00 PM</p>
                        <p className="text-muted-foreground">Weekends: Variable</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold">Season Length</p>
                        <p className="text-muted-foreground">18-20 games (April - July)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold">Locations</p>
                        <p className="text-muted-foreground">CDBL Championship Field</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold">Game Times</p>
                        <p className="text-muted-foreground">Weekend tournaments</p>
                        <p className="text-muted-foreground">Weekday practices</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold">Season Length</p>
                        <p className="text-muted-foreground">8-15 tournaments (May - August)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold">Locations</p>
                        <p className="text-muted-foreground">Regional tournament sites</p>
                      </div>
                    </div>
                  </div>
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
              Once the season begins, you can view your team's complete schedule, game results, and standings on SportsConnect.
            </p>
            <Button variant="default" size="lg" onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2121019', '_blank')} className="bg-white text-primary hover:bg-white/90 shadow-lg font-semibold">
              Access SportsConnect <ExternalLink className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>;
};
export default Schedule;