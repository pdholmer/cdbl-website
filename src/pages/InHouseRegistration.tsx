import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Calendar, DollarSign, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { usePrograms } from "@/hooks/usePrograms";
import { Skeleton } from "@/components/ui/skeleton";

const InHouseRegistration = () => {
  const { inHouseProgram, inHouseDivisions, isLoading } = usePrograms();

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
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Register for In-House Baseball</h1>
            <p className="text-xl mb-8 max-w-2xl">Join the recreational league where every child plays and learns the game!</p>
            <p className="text-sm text-primary-foreground/80 mb-4">
              Clicking "Register Now" will open our secure registration partner, SportsConnect, in a new tab. Return here any time for program information.
            </p>
            <Button 
              size="lg" 
              variant="hero"
              onClick={() => window.open('https://registration.bluesombrero.com/84830/program-questions/preview/80130405', '_blank')}
              className="bg-background text-foreground hover:bg-background/90"
            >
              Register Now on SportsConnect <ExternalLink className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* Key Information Cards */}
        <section className="py-16 bg-background">
          <div className="container">
            {isLoading ? (
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-8 w-8 mb-2" />
                      <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <Card>
                  <CardHeader>
                    <Calendar className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Important Dates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-muted-foreground">
                      <li><strong>Early Registration:</strong> December 1, 2025</li>
                      <li><strong>Regular Registration:</strong> January 15, 2026</li>
                      <li><strong>Late Registration:</strong> March 1, 2026</li>
                      {inHouseProgram?.season_start && (
                        <li><strong>Season Starts:</strong> {new Date(inHouseProgram.season_start).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</li>
                      )}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <DollarSign className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>In-House Fees</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-muted-foreground">
                      {inHouseDivisions?.map((division) => (
                        <li key={division.id}>
                          <strong>{division.name} (Ages {division.age_range}):</strong>{' '}
                          {division.cost != null ? `$${division.cost}` : 'TBD — Contact registrar@cdbaseball.org'}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Users className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>What's Included</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Official CDBL jersey</li>
                      <li>• MLB team hat</li>
                      <li>• 12-16 game season</li>
                      <li>• Professional coaching</li>
                      <li>• End-of-season tournament</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>

        {/* No Tryouts Section */}
        <section className="py-16 bg-muted/30">
          <div className="container max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">All Players Welcome!</h2>
            <p className="text-xl text-muted-foreground mb-8">
              In-House baseball has <strong>no tryouts</strong>. Every child who registers gets to play on a team. 
              Teams are balanced by the player agent to ensure fair, competitive games.
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <Card>
                <CardContent className="pt-6">
                  <p className="font-bold text-lg mb-2">✓ No Tryouts</p>
                  <p className="text-sm text-muted-foreground">Everyone makes a team</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="font-bold text-lg mb-2">✓ All Skill Levels</p>
                  <p className="text-sm text-muted-foreground">Beginners to experienced</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="font-bold text-lg mb-2">✓ Fair Play</p>
                  <p className="text-sm text-muted-foreground">Balanced teams</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-primary">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-primary-foreground">Frequently Asked Questions</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-background">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-3">Are scholarships or financial assistance available?</h3>
                  <p className="text-muted-foreground text-sm">
                    Yes! CDBL is committed to making baseball accessible to all families. We offer need-based scholarships and payment plans. Contact our Treasurer at treasurer@cdbaseball.org or 847-531-3237 for confidential assistance.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-background">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-3">Do you offer sibling discounts or family caps?</h3>
                  <p className="text-muted-foreground text-sm">
                    Yes! Families registering multiple children receive a 10% discount on the second child and 15% on additional children. Maximum family fee is capped at $400 for in-house programs.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-background">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-3">What is your refund policy?</h3>
                  <p className="text-muted-foreground text-sm">
                    Full refunds are available before March 1, 2026. After March 1, a 50% refund is available until the first game. No refunds after the season starts, except for documented medical reasons.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-background">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-3">What equipment does my child need?</h3>
                  <p className="text-muted-foreground text-sm">
                    CDBL provides jerseys and hats. Players need: glove, bat (or can borrow team bats), helmet with face guard (ages 4-12), baseball pants, cleats (no metal under age 13), athletic cup (required for catchers and recommended for all), and water bottle. Catchers gear is provided by the league.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-background">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-3">What volunteer commitments are required?</h3>
                  <p className="text-muted-foreground text-sm">
                    All families are asked to volunteer for 2 concession stand shifts per season and help with one league event (opening day, field cleanup, etc.). Coaching and assistant coaching positions are always welcome but not required.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-background">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-3">When are evaluations and the draft?</h3>
                  <p className="text-muted-foreground text-sm">
                    Player evaluations are held March 8-9, 2026. The draft takes place March 15, 2026. Teams are formed by the player agent to ensure balanced, competitive play.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How to Register Section */}
        <section className="py-16 bg-background">
          <div className="container max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">How to Register</h2>
            <p className="text-center text-muted-foreground mb-8">
              New to CDBL? <Link to="/new-to-cdbl" className="text-primary hover:underline font-semibold">Check out our orientation guide</Link> for everything you need to know.
            </p>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Visit SportsConnect</h3>
                  <p className="text-muted-foreground">Click the "Register Now" button to access our registration system powered by SportsConnect.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Create Your Account</h3>
                  <p className="text-muted-foreground">If you've registered with CDBL before, you'll need to create a new account in our updated registration system — it only takes 2 minutes.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Select In-House Program</h3>
                  <p className="text-muted-foreground">Choose the In-House program and select your child's age division.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">4</div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Submit Payment</h3>
                  <p className="text-muted-foreground">Pay your registration fee securely online. Payment plans may be available.</p>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Clicking "Start Registration" will open our secure registration partner, SportsConnect, in a new tab. Return here any time for program information.
              </p>
              <Button 
                size="lg" 
                variant="hero"
                onClick={() => window.open('https://registration.bluesombrero.com/84830/program-questions/preview/80130405', '_blank')}
              >
                Start Registration <ExternalLink className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default InHouseRegistration;
