import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Calendar, DollarSign, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import heroRegistration from "@/assets/hero-registration.jpg";
import { usePrograms } from "@/hooks/usePrograms";
import { useFAQs } from "@/hooks/useFAQs";
import { Skeleton } from "@/components/ui/skeleton";

const Registration = () => {
  const { inHouseProgram, travelProgram, inHouseDivisions, isLoading: programsLoading } = usePrograms();
  const { faqs, isLoading: faqsLoading } = useFAQs();

  const isLoading = programsLoading || faqsLoading;

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section 
          className="relative py-16 md:py-24 text-primary-foreground overflow-hidden bg-cover bg-center sm:bg-center md:bg-[65%_center]"
          style={{ 
            backgroundImage: `linear-gradient(to right, hsla(215, 100%, 26%, 0.9) 0%, hsla(201, 63%, 56%, 0.1) 100%), url('${heroRegistration}')`
          }}
        >
          <div className="container">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Register for 2026 Season</h1>
            <p className="text-xl mb-8 max-w-2xl">Join the CDBL family! Registration is now open for the 2026 baseball season.</p>
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
                      {inHouseProgram?.season_start && (
                        <li><strong>Season Starts:</strong> {new Date(inHouseProgram.season_start).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</li>
                      )}
                      {inHouseProgram?.season_end && (
                        <li><strong>Season Ends:</strong> {new Date(inHouseProgram.season_end).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</li>
                      )}
                      <li><strong>Status:</strong> {inHouseProgram?.registration_open ? 'Registration Open' : 'Registration Closed'}</li>
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
                      {inHouseDivisions?.[0]?.features && Array.isArray(inHouseDivisions[0].features) ? (
                        inHouseDivisions[0].features.map((feature: string, idx: number) => (
                          <li key={idx}>• {feature}</li>
                        ))
                      ) : (
                        <>
                          <li>• Official CDBL jersey</li>
                          <li>• Team hat</li>
                          <li>• 12-16 game season</li>
                          <li>• Professional coaching</li>
                          <li>• Tournament opportunities</li>
                        </>
                      )}
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

        {/* FAQ Section */}
        <section className="py-16 bg-background">
          <div className="container max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
            
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : faqs && faqs.length > 0 ? (
              <div className="space-y-6">
                {faqs.map((faq) => (
                  <div key={faq.id} className="p-6 bg-card rounded-lg border">
                    <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-6 bg-card rounded-lg border">
                  <h3 className="font-bold text-lg mb-2">Are scholarships or financial assistance available?</h3>
                  <p className="text-muted-foreground">
                    Yes! CDBL is committed to making baseball accessible to all families. Contact us for more information.
                  </p>
                </div>
              </div>
            )}
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

export default Registration;