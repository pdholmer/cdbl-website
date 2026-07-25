import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { usePrograms } from "@/hooks/usePrograms";
import { useAllPrograms } from "@/hooks/useAllPrograms";
import { useFAQs } from "@/hooks/useFAQs";
import { Skeleton } from "@/components/ui/skeleton";

const Registration = () => {
  const { inHouseProgram, inHouseDivisions, isLoading: programsLoading } = usePrograms();
  const { travelProgram } = useAllPrograms();
  const { faqs, isLoading: faqsLoading } = useFAQs();

  const tryoutUrl = (travelProgram as any)?.tryout_registration_url?.trim() || null;
  const coachUrl = (travelProgram as any)?.coach_registration_url?.trim() || null;
  const showTravelBanner = Boolean(tryoutUrl || coachUrl);

  const isLoading = programsLoading || faqsLoading;

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section - Registration Closed */}
        <section 
          className="relative py-16 md:py-24 text-primary-foreground overflow-hidden"
          style={{ background: 'var(--gradient-hero)' }}
        >
          <div className="container">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">2026 Registration is Closed</h1>
            <p className="text-xl max-w-2xl mb-8">
              The 2026 season is underway! Explore our schedule, find your team, or get involved as a volunteer.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" asChild className="bg-white text-primary hover:bg-white/90 font-semibold">
                <Link to="/schedule">View Schedule <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-primary font-semibold">
                <Link to="/teams">View Teams</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-primary font-semibold">
                <Link to="/volunteer">Volunteer</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* 2027 Travel Registration Open Announcement */}
        <section className="py-8 bg-gradient-to-r from-primary to-accent text-primary-foreground border-y-4 border-white/20">
          <div className="container">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="mt-1 h-3 w-3 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide opacity-90 mb-1">Now Open</p>
                  <h2 className="text-xl md:text-2xl font-bold leading-tight">
                    2027 Travel Tryouts & Travel Coach Registration
                  </h2>
                  <p className="text-sm md:text-base opacity-90 mt-1">
                    Sign up today for the CDBL Rockets 2027 season. Tryouts held July 2026.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto flex-shrink-0">
                <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold">
                  <a href="https://registration-setup.bluesombrero.com/registration-admin/84830/programs" target="_blank" rel="noopener noreferrer">
                    Register for Tryouts <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-primary font-semibold">
                  <a href="https://registration-setup.bluesombrero.com/registration-admin/84830/programs" target="_blank" rel="noopener noreferrer">
                    Coach Registration
                  </a>
                </Button>
              </div>
            </div>
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
                    <CardTitle>Season Dates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-muted-foreground">
                      {inHouseProgram?.season_start && (
                        <li><strong>Season Started:</strong> {new Date(inHouseProgram.season_start).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</li>
                      )}
                      {inHouseProgram?.season_end && (
                        <li><strong>Season Ends:</strong> {new Date(inHouseProgram.season_end).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</li>
                      )}
                      <li><strong>Status:</strong> Season in progress</li>
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
                      {inHouseDivisions?.map((division) => (
                        <li key={division.id}>
                          <strong>{division.name} (Ages {division.age_range}):</strong> {division.cost != null ? `$${division.cost}` : 'TBD'}
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
                    <td className="p-4">Ages 4-14 (T-Ball through Pony)</td>
                    <td className="p-4">Ages 8-14 (8U through 14U)</td>
                  </tr>
                  <tr className="border-b bg-muted/30">
                    <td className="p-4 font-semibold">Registration Fee</td>
                    <td className="p-4">$195-$335 per season</td>
                    <td className="p-4">~$600/season + tournaments</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-semibold">Time Commitment</td>
                    <td className="p-4">1-2 practices + 1-2 games per week</td>
                    <td className="p-4">2-3 practices + 2-3 games per week + tournaments</td>
                  </tr>
                  <tr className="border-b bg-muted/30">
                    <td className="p-4 font-semibold">Season Length</td>
                    <td className="p-4">March - August</td>
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
                    <td className="p-4">Tryouts required (July 2026)</td>
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
          </div>
        </section>

        {/* All Players Welcome */}
        <section className="py-16 bg-background">
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
            
            {isLoading ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="bg-background">
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : faqs && faqs.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-6">
                {faqs.map((faq) => (
                  <Card key={faq.id} className="bg-background">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-lg mb-3">{faq.question}</h3>
                      <p className="text-muted-foreground text-sm">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
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
                      CDBL provides jerseys and hats. Players need: glove, bat (or can borrow team bats), helmet (face guard optional), baseball pants, cleats (no metal under age 13), athletic cup (recommended for all players), and water bottle. Catchers gear is provided by the league.
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
            )}
          </div>
        </section>

        {/* Next Steps CTA - replaces "How to Register" */}
        <section className="py-16 bg-background">
          <div className="container max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Connected</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Registration for the 2026 season has closed. Here's how to stay involved with CDBL.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <Calendar className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-bold mb-2">Game Schedule</h3>
                  <p className="text-sm text-muted-foreground mb-4">Find upcoming games and field assignments</p>
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/schedule">View Schedule <ArrowRight className="ml-1 h-4 w-4" /></Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-bold mb-2">Find Your Team</h3>
                  <p className="text-sm text-muted-foreground mb-4">See team rosters and divisions</p>
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/teams">View Teams <ArrowRight className="ml-1 h-4 w-4" /></Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <Calendar className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-bold mb-2">Volunteer</h3>
                  <p className="text-sm text-muted-foreground mb-4">Help make the season great for everyone</p>
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/volunteer">Sign Up <ArrowRight className="ml-1 h-4 w-4" /></Link>
                  </Button>
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

export default Registration;
