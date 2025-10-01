import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Calendar, DollarSign, Users } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Registration = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary-light py-20 text-primary-foreground">
          <div className="container">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Register for 2026 Season</h1>
            <p className="text-xl mb-8 max-w-2xl">Join the CDBL family! Registration is now open for the 2026 baseball season.</p>
            <Button 
              size="lg" 
              variant="hero"
              onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2121019', '_blank')}
              className="bg-background text-foreground hover:bg-background/90"
            >
              Register Now on SportsConnect <ExternalLink className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* Key Information Cards */}
        <section className="py-16 bg-background">
          <div className="container">
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
                    <li><strong>Season Starts:</strong> April 2026</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <DollarSign className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Registration Fees</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>T-Ball (Ages 4-6):</strong> $75</li>
                    <li><strong>Pinto (Ages 7-8):</strong> $95</li>
                    <li><strong>Bronco (Ages 9-10):</strong> $115</li>
                    <li><strong>Pony (Ages 11-12):</strong> $135</li>
                    <li><strong>Colt (Ages 13-14):</strong> $155</li>
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
                    <li>• Team hat</li>
                    <li>• 12-16 game season</li>
                    <li>• Professional coaching</li>
                    <li>• Tournament opportunities</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* In-House vs Travel Comparison */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">In-House vs Travel Baseball</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Not sure which program is right for your child? Here's a quick comparison to help you decide.
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full max-w-5xl mx-auto bg-card rounded-lg">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-bold">Feature</th>
                    <th className="text-left p-4 font-bold text-primary">In-House League</th>
                    <th className="text-left p-4 font-bold text-primary">Travel Baseball</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4 font-semibold">Age Groups</td>
                    <td className="p-4">Ages 4-14 (T-Ball through Colt)</td>
                    <td className="p-4">Ages 8-14 (8U through 14U)</td>
                  </tr>
                  <tr className="border-b bg-muted/30">
                    <td className="p-4 font-semibold">Registration Fee</td>
                    <td className="p-4">$75-$155 per season</td>
                    <td className="p-4">~$600 per season + tournament fees</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-semibold">Time Commitment</td>
                    <td className="p-4">1-2 practices + 1-2 games per week</td>
                    <td className="p-4">2-3 practices + 2-3 games per week + tournaments</td>
                  </tr>
                  <tr className="border-b bg-muted/30">
                    <td className="p-4 font-semibold">Season Length</td>
                    <td className="p-4">April - June/July (12-16 games)</td>
                    <td className="p-4">March - August (50+ games)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-semibold">Travel Required</td>
                    <td className="p-4">Local fields only</td>
                    <td className="p-4">Regional tournaments (weekend trips)</td>
                  </tr>
                  <tr className="border-b bg-muted/30">
                    <td className="p-4 font-semibold">Tryouts</td>
                    <td className="p-4">No tryouts - all players accepted</td>
                    <td className="p-4">Tryouts required (March 8-9, 2026)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-semibold">Competition Level</td>
                    <td className="p-4">Recreational, balanced teams</td>
                    <td className="p-4">Competitive, elite players</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">Best For</td>
                    <td className="p-4">Learning fundamentals, having fun, all skill levels</td>
                    <td className="p-4">Experienced players seeking advanced competition</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-12 p-6 bg-primary/10 rounded-lg max-w-3xl mx-auto">
              <h3 className="text-xl font-bold mb-3">Is Travel Right for My Child?</h3>
              <p className="text-muted-foreground mb-4">
                Travel baseball requires a higher level of commitment from both players and families. Consider travel if your child:
              </p>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li>• Has played multiple seasons and shows strong fundamental skills</li>
                <li>• Is passionate about baseball and eager to practice frequently</li>
                <li>• Can commit to weekend tournaments and additional practice schedules</li>
                <li>• Your family can support the time commitment and travel expenses</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                <strong>Not sure?</strong> Start with In-House and consider travel in future seasons!
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-background">
          <div className="container max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div className="p-6 bg-card rounded-lg border">
                <h3 className="font-bold text-lg mb-2">Are scholarships or financial assistance available?</h3>
                <p className="text-muted-foreground">
                  Yes! CDBL is committed to making baseball accessible to all families. We offer need-based scholarships and payment plans. Contact our Treasurer, Sarah Johnson, at treasurer@cdbl.org or (555) 123-4567 for confidential assistance.
                </p>
              </div>

              <div className="p-6 bg-card rounded-lg border">
                <h3 className="font-bold text-lg mb-2">Do you offer sibling discounts or family caps?</h3>
                <p className="text-muted-foreground">
                  Yes! Families registering multiple children receive a 10% discount on the second child and 15% on additional children. Maximum family fee is capped at $400 for in-house programs (excluding travel).
                </p>
              </div>

              <div className="p-6 bg-card rounded-lg border">
                <h3 className="font-bold text-lg mb-2">What is your refund policy?</h3>
                <p className="text-muted-foreground">
                  Full refunds are available before March 1, 2026. After March 1, a 50% refund is available until the first game. No refunds after the season starts, except for documented medical reasons.
                </p>
              </div>

              <div className="p-6 bg-card rounded-lg border">
                <h3 className="font-bold text-lg mb-2">What equipment does my child need?</h3>
                <p className="text-muted-foreground">
                  CDBL provides jerseys and hats. Players need: glove, bat (or can borrow team bats), helmet with face guard (ages 4-12), cleats (no metal under age 13), athletic cup (required for catchers and recommended for all), and water bottle. Catchers gear is provided by the league.
                </p>
              </div>

              <div className="p-6 bg-card rounded-lg border">
                <h3 className="font-bold text-lg mb-2">What volunteer commitments are required?</h3>
                <p className="text-muted-foreground">
                  All families are asked to volunteer for 2 concession stand shifts per season and help with one league event (opening day, field cleanup, etc.). Coaching and assistant coaching positions are always welcome but not required.
                </p>
              </div>

              <div className="p-6 bg-card rounded-lg border">
                <h3 className="font-bold text-lg mb-2">When are evaluations and the draft?</h3>
                <p className="text-muted-foreground">
                  Player evaluations are held March 8-9, 2026. The draft takes place March 15, 2026. Teams are formed by the player agent to ensure balanced, competitive play. Travel team tryouts are also March 8-9.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How to Register Section */}
        <section className="py-16 bg-background">
          <div className="container max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">How to Register</h2>
            
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
                  <h3 className="font-bold text-lg mb-2">Create or Log In</h3>
                  <p className="text-muted-foreground">Create a new account or log in if you've registered with CDBL before.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Complete Player Information</h3>
                  <p className="text-muted-foreground">Fill out your child's information, select their division, and choose your preferred program.</p>
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
              <Button 
                size="lg" 
                variant="hero"
                onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2121019', '_blank')}
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

export default Registration;