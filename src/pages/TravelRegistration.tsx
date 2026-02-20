import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Calendar, MapPin, FileText, ChevronRight } from "lucide-react";
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
            background: "linear-gradient(135deg, hsl(215 100% 26%) 0%, hsl(201 63% 56%) 100%)",
          }}
        >
          <div className="container">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Tryouts & Registration</h1>
            <p className="text-xl max-w-2xl">
              Everything you need to know about trying out for the CDBL Rockets travel program.
            </p>
          </div>
        </section>

        {/* Sub-page Navigation Grid */}
        <section className="py-10 bg-muted/30 border-b border-border">
          <div className="container">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <Link
                to="/travel"
                className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border hover:border-primary hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <ChevronRight className="h-5 w-5 text-primary rotate-180" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">Travel Overview</p>
                  <p className="text-xs text-muted-foreground">About the Rockets program</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </Link>

              <Link
                to="/travel/schedule"
                className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border hover:border-primary hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">Tournament Schedule</p>
                  <p className="text-xs text-muted-foreground">Upcoming tournaments & events</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </Link>

              <Link
                to="/travel/faq"
                className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border hover:border-primary hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">Travel FAQ</p>
                  <p className="text-xs text-muted-foreground">Common questions answered</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </Link>
            </div>
          </div>
        </section>

        {/* Tryout Information */}
        <section className="py-16 bg-background">
          <div className="container max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Tryout Information</h2>

            <div className="space-y-6">
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                <CardHeader>
                  <CardTitle className="text-2xl">2027 Season Tryouts (held Fall 2026)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold mb-1">
                        Tryouts for the 2027 season will take place in July 2026.
                      </p>
                      <p className="text-muted-foreground">
                        Specific dates and registration information will be announced in early 2026. Check back for
                        updates!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>What to Bring</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>✓ Baseball glove</li>
                    <li>✓ Bat (or use team bats provided)</li>
                    <li>✓ Batting helmet</li>
                    <li>✓ Baseball pants</li>
                    <li>✓ Cleats</li>
                    <li>✓ Athletic wear and water bottle</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Evaluation Process</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Players are evaluated on:</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      • <strong>Hitting:</strong> Bat speed, contact consistency, power potential
                    </li>
                    <li>
                      • <strong>Fielding:</strong> Hands, footwork, arm strength, accuracy
                    </li>
                    <li>
                      • <strong>Speed:</strong> Base running instincts
                    </li>
                    <li>
                      • <strong>Throwing:</strong> Velocity, accuracy from position
                    </li>
                    <li>
                      • <strong>Game Awareness:</strong> Baseball IQ, coachability, attitude
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Commitment Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">Time Commitment</p>
                    <ul className="text-muted-foreground space-y-1 ml-4">
                      <li>• 1-2 practices per week (weeknights)</li>
                      <li>• 1-2 games per week during season</li>
                      <li>• 5-8 weekend tournaments (possible overnight travel)</li>
                      <li>• Season: January - March (Training), April - July (Games/Tournaments)</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Financial Investment</p>
                    <ul className="text-muted-foreground space-y-1 ml-4">
                      <li>• Registration fee: ~$400</li>
                      <li>• Uniform package: $150 - $350 (varies by age group)</li>
                      <li>• Total typical cost: $1,500-$3,000 per season (depends on the team)</li>
                      <li>• Additional Expenses (possible): Travel, hotel, meals and gas</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 p-6 bg-primary/10 rounded-lg">
              <h3 className="text-xl font-bold mb-3">Is Your Child Ready for Travel?</h3>
              <p className="text-muted-foreground mb-4">
                Travel baseball requires dedication from players and families. Consider these factors:
              </p>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li>✓ Multiple seasons of baseball experience</li>
                <li>✓ Strong fundamental skills and game knowledge</li>
                <li>✓ Genuine passion for the game and desire to improve</li>
                <li>✓ Family can commit to weekend travel and practice schedule</li>
                <li>✓ Financial investment fits family budget</li>
              </ul>
            </div>

            <div className="mt-8 text-center">
              <p className="text-muted-foreground">
                <strong>Questions?</strong> Contact our Travel Coordinator at{" "}
                <a href="mailto:travel@cdbaseball.org" className="text-primary hover:underline">
                  travel@cdbaseball.org
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Join the Rockets?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Tryouts for the 2027 season will be held in July 2026. Check back for registration details.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="default" size="lg" asChild className="bg-white text-primary hover:bg-white/90 shadow-lg font-semibold">
                <Link to="/travel">Back to Travel Overview</Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="border-white text-white hover:bg-white/10">
                <Link to="/travel/faq">Read the FAQ</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TravelRegistration;
