import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Calendar, DollarSign, Target } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TravelRegistration = () => {
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
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Travel Team Tryouts & Registration</h1>
            <p className="text-xl mb-8 max-w-2xl">Ready to compete at the elite level? Register for Rockets travel team tryouts.</p>
            <Button 
              size="lg" 
              variant="hero"
              onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2121019', '_blank')}
              className="bg-background text-foreground hover:bg-background/90"
            >
              Register for Tryouts <ExternalLink className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* Key Information */}
        <section className="py-16 bg-background">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardHeader>
                  <Calendar className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Tryout Dates</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>Primary Tryouts:</strong> March 8-9, 2026</li>
                    <li><strong>Callbacks:</strong> March 9 (by invitation)</li>
                    <li><strong>Team Announcements:</strong> March 10, 2026</li>
                    <li><strong>Season Starts:</strong> Late March 2026</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <DollarSign className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Financial Investment</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>Registration Fee:</strong> ~$600</li>
                    <li><strong>Tournament Fees:</strong> $1,500-$2,500</li>
                    <li><strong>Travel Expenses:</strong> Hotels, meals, gas</li>
                    <li><strong>Total Season Cost:</strong> $2,500-$3,500</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Target className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>What to Bring</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Baseball glove</li>
                    <li>• Bat & batting helmet</li>
                    <li>• Cleats (turf for indoor)</li>
                    <li>• Athletic wear & water</li>
                    <li>• Registration form</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Tryout Evaluation Process */}
        <section className="py-16 bg-muted/30">
          <div className="container max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Evaluation Process</h2>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>What Coaches Look For</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Players are evaluated on five key areas:
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li>
                    <strong className="text-foreground">Hitting:</strong> Bat speed, contact consistency, power potential, approach at the plate
                  </li>
                  <li>
                    <strong className="text-foreground">Fielding:</strong> Hands, footwork, range, arm strength, accuracy from position
                  </li>
                  <li>
                    <strong className="text-foreground">Speed:</strong> 60-yard dash time, base running instincts, acceleration
                  </li>
                  <li>
                    <strong className="text-foreground">Throwing:</strong> Arm velocity, accuracy, mechanics, release time
                  </li>
                  <li>
                    <strong className="text-foreground">Game Awareness:</strong> Baseball IQ, coachability, attitude, effort, teamwork
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tryout Day Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">Saturday, March 8</p>
                    <ul className="text-muted-foreground space-y-1 ml-4">
                      <li>• 8:00 AM - 9:00 AM: Check-in & Warm-ups</li>
                      <li>• 9:00 AM - 12:00 PM: 8U & 10U Evaluations</li>
                      <li>• 1:00 PM - 4:00 PM: 12U & 14U Evaluations</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Sunday, March 9</p>
                    <ul className="text-muted-foreground space-y-1 ml-4">
                      <li>• Times TBD - Callback sessions (invitation only)</li>
                      <li>• Simulated game situations</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Monday, March 10</p>
                    <ul className="text-muted-foreground space-y-1 ml-4">
                      <li>• Team announcements via email</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Commitment Requirements */}
        <section className="py-16 bg-background">
          <div className="container max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Understanding the Commitment</h2>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Time Commitment</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>Practices:</strong> 2-3 weeknight practices per week (1.5-2 hours each)</li>
                    <li><strong>Regular Season Games:</strong> 2-3 games per week during season</li>
                    <li><strong>Weekend Tournaments:</strong> 8-15 tournaments (overnight travel)</li>
                    <li><strong>Season Length:</strong> March through August (6 months)</li>
                    <li><strong>Total Games:</strong> 50-70 games per season</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Family Commitment</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Weekend travel to tournaments (hotels, meals)</li>
                    <li>• Transportation to practices and games</li>
                    <li>• Volunteer duties (concessions, field maintenance)</li>
                    <li>• Fundraising participation</li>
                    <li>• Communication with coaches and team families</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-primary/5">
                <CardHeader>
                  <CardTitle>Is Travel Right for Your Family?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Travel baseball requires dedication from players and families. Consider these factors:
                  </p>
                  <ul className="space-y-2 text-muted-foreground ml-4">
                    <li>✓ Player has multiple seasons of baseball experience</li>
                    <li>✓ Strong fundamental skills and game knowledge</li>
                    <li>✓ Genuine passion for the game and desire to improve</li>
                    <li>✓ Family can commit to weekend travel and practice schedule</li>
                    <li>✓ Financial investment fits within family budget</li>
                    <li>✓ Player can balance baseball with school and other activities</li>
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    <strong>Not sure?</strong> Consider starting with In-House and transitioning to travel in future seasons. 
                    Many successful travel players began in our recreational program!
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How to Register */}
        <section className="py-16 bg-muted/30">
          <div className="container max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">How to Register for Tryouts</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Visit SportsConnect</h3>
                  <p className="text-muted-foreground">Click the "Register for Tryouts" button to access our registration system.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Select Travel Program</h3>
                  <p className="text-muted-foreground">Choose "Travel/Tryouts" and select your child's age division.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Complete Player Information</h3>
                  <p className="text-muted-foreground">Fill out all required information including playing experience and positions.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">4</div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Attend Tryouts</h3>
                  <p className="text-muted-foreground">Show up on tryout day ready to compete and showcase your skills!</p>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Button 
                size="lg" 
                variant="hero"
                onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2121019', '_blank')}
              >
                Register for Tryouts <ExternalLink className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Questions? Contact our Travel Coordinator at <a href="mailto:travel@cdbl.org" className="text-primary hover:underline">travel@cdbl.org</a>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TravelRegistration;