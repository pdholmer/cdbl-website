import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, ShoppingBag, Camera, Trophy, Clipboard, Heart, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NewToCDBL = () => {
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
            <h1 className="text-4xl md:text-6xl font-bold mb-6">New to CDBL?</h1>
            <p className="text-xl max-w-2xl">Everything you need to know to get started with your child's baseball journey.</p>
          </div>
        </section>

        {/* Getting Started Timeline */}
        <section className="py-16 bg-background">
          <div className="container max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Getting Started Timeline</h2>
            
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">1</div>
                <div className="flex-1 pb-8 border-l-2 border-border pl-6 ml-6">
                  <h3 className="text-xl font-bold mb-2">Register Your Child</h3>
                  <p className="text-muted-foreground mb-3">
                    Complete online registration through SportsConnect. Early registration opens December 1st with the best pricing.
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/registration">Registration Info</Link>
                  </Button>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">2</div>
                <div className="flex-1 pb-8 border-l-2 border-border pl-6 ml-6">
                  <h3 className="text-xl font-bold mb-2">Attend Player Evaluations</h3>
                  <p className="text-muted-foreground">
                    <strong>March 8-9, 2026:</strong> All players (except T-Ball) attend evaluations so coaches can draft balanced teams. Bring your glove and be ready to have fun!
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">3</div>
                <div className="flex-1 pb-8 border-l-2 border-border pl-6 ml-6">
                  <h3 className="text-xl font-bold mb-2">Draft Day & Team Assignment</h3>
                  <p className="text-muted-foreground">
                    <strong>March 15, 2026:</strong> Coaches draft teams. You'll be notified of your child's team and coach by March 20th via email.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">4</div>
                <div className="flex-1 pb-8 border-l-2 border-border pl-6 ml-6">
                  <h3 className="text-xl font-bold mb-2">First Team Practice</h3>
                  <p className="text-muted-foreground">
                    Late March: Your coach will contact you with practice schedule and team details. Meet your teammates and get ready for the season!
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">5</div>
                <div className="flex-1 pl-6 ml-6">
                  <h3 className="text-xl font-bold mb-2">Opening Day & Season</h3>
                  <p className="text-muted-foreground">
                    <strong>April 2026:</strong> League opens with ceremonies and first games. Season runs through June/July depending on division.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What to Expect */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">What to Expect</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <ShoppingBag className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Equipment Needs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    <strong>CDBL Provides:</strong> Jersey, hat, team equipment
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>You Provide:</strong>
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Baseball glove (appropriate for age)</li>
                    <li>• Batting helmet with face guard</li>
                    <li>• Cleats (no metal under age 13)</li>
                    <li>• Athletic cup (required for catchers)</li>
                    <li>• Water bottle</li>
                    <li>• Bat (optional, can use team bats)</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Calendar className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Practice & Game Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Typical weekly schedule varies by division:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li><strong>T-Ball:</strong> 1 practice + Saturday games</li>
                    <li><strong>Pinto-Bronco:</strong> 2 practices + 1-2 games</li>
                    <li><strong>Pony-Colt:</strong> 2-3 practices + 2 games</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-3">
                    Games typically 6:00pm weeknights or Saturday mornings/afternoons.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Heart className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Parent Volunteer Duties</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    All families are asked to help out:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• 2 concession stand shifts per season</li>
                    <li>• Help at 1 league event (Opening Day, field cleanup, fundraiser)</li>
                    <li>• Optional: Coaching, team parent, scorekeeper</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-3">
                    Sign-ups coordinated by your team coach.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Clipboard className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Playing Time Policy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    CDBL is committed to fair play:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Every player plays at least 3 innings per game</li>
                    <li>• Positions rotated throughout season</li>
                    <li>• No player sits out consecutive innings</li>
                    <li>• Emphasis on development over winning</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Camera className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Picture Day & Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Special events throughout the season:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Team & individual photos (Spring)</li>
                    <li>• Opening Day ceremonies</li>
                    <li>• All-Star games</li>
                    <li>• End-of-season celebration</li>
                    <li>• Spirit Wear sales throughout season</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Trophy className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Sportsmanship & Conduct</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    We emphasize respect and integrity:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Zero tolerance for unsportsmanlike conduct</li>
                    <li>• Respect for umpires, coaches, opponents</li>
                    <li>• Positive encouragement only</li>
                    <li>• Code of Conduct for players & parents</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Communication */}
        <section className="py-16 bg-background">
          <div className="container max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Staying Connected</h2>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Team Communication</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Your coach will be your primary contact for team-specific information. They'll communicate practice schedules, game times, rainouts, and team events via email and/or team app.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Calendar className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>League Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Important league-wide announcements (weather cancellations, events, policy updates) will be sent via email to the address you used during registration. Check your spam folder and add info@cdbl.org to your contacts.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <HelpCircle className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Questions or Concerns?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    We're here to help! Contact us anytime with questions about registration, rules, or league operations.
                  </p>
                  <Button asChild>
                    <Link to="/contact">Contact CDBL</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Register your child today and join the CDBL family for an unforgettable baseball season!
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                variant="default" 
                size="lg"
                asChild
                className="bg-white text-primary hover:bg-white/90 shadow-lg font-semibold"
              >
                <Link to="/registration">Register Now</Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                asChild
                className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-carolina hover:border-white font-semibold"
              >
                <Link to="/teams">View Programs</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default NewToCDBL;
