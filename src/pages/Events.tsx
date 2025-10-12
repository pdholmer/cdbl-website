import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Trophy, Users, Star } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import heroEvents from "@/assets/hero-events.jpg";

const Events = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section 
          className="relative py-16 md:py-24 text-primary-foreground overflow-hidden bg-cover bg-center sm:bg-center md:bg-[65%_center]"
          style={{ 
            backgroundImage: `linear-gradient(to right, hsla(215, 100%, 26%, 0.9) 0%, hsla(201, 63%, 56%, 0.1) 100%), url('${heroEvents}')`
          }}
        >
          <div className="container">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Events & News</h1>
            <p className="text-xl max-w-2xl">Stay updated on CDBL tournaments, special events, and league announcements.</p>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="py-16 bg-background">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">Upcoming Events - 2026</h2>
            
            <div className="space-y-6 max-w-4xl mx-auto">
              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">Opening Day Ceremony</CardTitle>
                      <CardDescription className="text-base">
                        <span className="font-semibold text-foreground">April 12, 2026</span> • 10:00 AM - 2:00 PM
                      </CardDescription>
                    </div>
                    <Trophy className="h-8 w-8 text-primary flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Kick off the 2026 season with our annual Opening Day celebration! Player introductions, first pitches from local dignitaries, and fun activities for the whole family.
                  </p>
                  <p className="text-sm font-semibold">Location: CDBL Main Complex</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">Spring Skills Clinic</CardTitle>
                      <CardDescription className="text-base">
                        <span className="font-semibold text-foreground">March 22-23, 2026</span> • 9:00 AM - 3:00 PM
                      </CardDescription>
                    </div>
                    <Star className="h-8 w-8 text-primary flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Two-day baseball clinic focusing on hitting, pitching, and fielding fundamentals. Led by experienced coaches and former college players. Open to ages 7-14.
                  </p>
                  <p className="text-sm font-semibold">Cost: $75 per player • Registration required</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">Father's Day Tournament</CardTitle>
                      <CardDescription className="text-base">
                        <span className="font-semibold text-foreground">June 14-15, 2026</span> • All Day
                      </CardDescription>
                    </div>
                    <Trophy className="h-8 w-8 text-primary flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Annual Father's Day Weekend Tournament featuring teams from across the region. Multiple divisions, championship games, and special Father's Day activities.
                  </p>
                  <p className="text-sm font-semibold">Location: All CDBL Fields</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">All-Star Game & Home Run Derby</CardTitle>
                      <CardDescription className="text-base">
                        <span className="font-semibold text-foreground">June 20, 2026</span> • 5:00 PM - 9:00 PM
                      </CardDescription>
                    </div>
                    <Star className="h-8 w-8 text-primary flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Watch the best players from each division compete in the annual All-Star Game. Festivities begin with the Home Run Derby competition at 5:00 PM.
                  </p>
                  <p className="text-sm font-semibold">Location: Championship Field • Free admission</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">Championship Weekend</CardTitle>
                      <CardDescription className="text-base">
                        <span className="font-semibold text-foreground">July 18-20, 2026</span> • All Day
                      </CardDescription>
                    </div>
                    <Trophy className="h-8 w-8 text-primary flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Season finale featuring championship games for all divisions. Trophy presentations, awards ceremony, and celebration of another great CDBL season.
                  </p>
                  <p className="text-sm font-semibold">Location: CDBL Main Complex</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">Volunteer Appreciation Night</CardTitle>
                      <CardDescription className="text-base">
                        <span className="font-semibold text-foreground">July 25, 2026</span> • 6:00 PM - 9:00 PM
                      </CardDescription>
                    </div>
                    <Users className="h-8 w-8 text-primary flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    An evening to honor all the coaches, board members, volunteers, and sponsors who make CDBL possible. Dinner, awards, and recognition ceremonies.
                  </p>
                  <p className="text-sm font-semibold">By invitation • RSVP required</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Recent News */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">Recent News & Announcements</h2>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>2026 Registration Now Open!</CardTitle>
                  <CardDescription>December 1, 2025</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Get ready for another exciting season! Early bird registration is now open. Register before January 15th to lock in discounted rates and guarantee your spot.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Field Improvements Complete</CardTitle>
                  <CardDescription>November 20, 2025</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Thanks to community support and fundraising efforts, we've completed major upgrades to Fields 2 and 3, including new dugouts, improved drainage, and fresh infield material.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>12U Rockets Win Regional Title</CardTitle>
                  <CardDescription>August 15, 2025</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Congratulations to our 12U Rockets travel team on winning the Regional Championship! The team went 5-1 in bracket play to bring home the trophy. Proud of you, boys!
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>New Board Members Elected</CardTitle>
                  <CardDescription>October 5, 2025</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Please welcome our newly elected board members: Sarah Johnson (Treasurer) and Mike Chen (Player Agent). Thank you to our outgoing members for their dedicated service!
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Subscribe Section */}
        <section className="py-16 bg-background">
          <div className="container max-w-2xl text-center">
            <Calendar className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay in the Loop</h2>
            <p className="text-muted-foreground mb-8">
              Follow us on social media for the latest updates, game highlights, and event announcements. Never miss what's happening at CDBL!
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="https://facebook.com/cdbl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 font-semibold"
              >
                Facebook
              </a>
              <span className="text-muted-foreground">•</span>
              <a
                href="https://instagram.com/cdbl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 font-semibold"
              >
                Instagram
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Events;