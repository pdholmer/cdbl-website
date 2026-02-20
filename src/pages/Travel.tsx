import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Rocket, Trophy, Target, Calendar, DollarSign, TrendingUp, Award, ChevronRight, FileText, MapPin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import heroTravelRockets from "@/assets/hero-travel-rockets.jpg";

const Travel = () => {
  return <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative min-h-[320px] sm:min-h-[360px] md:min-h-[420px] lg:min-h-[480px] py-16 md:py-24 text-primary-foreground overflow-hidden bg-cover bg-center sm:bg-center md:bg-[65%_center] flex items-center" style={{
        backgroundImage: `linear-gradient(to right, hsla(215, 100%, 26%, 0.9) 0%, hsla(201, 63%, 56%, 0.1) 100%), url('${heroTravelRockets}')`
      }}>
          <div className="container relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">CDBL Rockets</h1>
              <p className="text-base sm:text-lg md:text-xl mb-1 leading-relaxed opacity-95">Elite travel baseball building the pipeline to Burlington Central High School and beyond.</p>
              <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 leading-relaxed opacity-80 italic">Tryouts required. Ages 8–14.</p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Button variant="default" size="lg" asChild className="bg-white text-primary hover:bg-white/90 shadow-lg font-semibold">
                  <a href="#tryouts">2027 Season Tryouts (Fall 2026)</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Sub-page Navigation Grid */}
        <section className="py-10 bg-muted/30 border-b border-border">
          <div className="container">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <Link to="/travel#tryouts" className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border hover:border-primary hover:shadow-sm transition-all group">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">Tryouts & Registration</p>
                  <p className="text-xs text-muted-foreground">Dates, eligibility & process</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </Link>

              <Link to="/travel/schedule" className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border hover:border-primary hover:shadow-sm transition-all group">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">Tournament Schedule</p>
                  <p className="text-xs text-muted-foreground">Upcoming tournaments & events</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </Link>

              <Link to="/travel/faq" className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border hover:border-primary hover:shadow-sm transition-all group">
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

        {/* Building Future Rockets */}
        <section className="py-16 bg-background">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Building Future Rockets</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our travel program creates a direct pipeline to Burlington Central High School (District 301), 
                developing elite players who go on to compete at the highest levels.
              </p>
            </div>
          </div>
        </section>

        {/* Competitive Advantages */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">What Makes Rockets Competitive</h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Proven Track Record</h3>
                <p className="text-muted-foreground">
                  Multiple state tournament appearances, regional championships, and consistent top-tier finishes in elite divisions.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Elite Coaching Staff</h3>
                <p className="text-muted-foreground">
                  Experienced coaches with high school and college playing backgrounds. Focus on advanced skill development and game strategy.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">High School Pipeline</h3>
                <p className="text-muted-foreground">
                  Direct pathway to Burlington Central High School varsity program. Many Rockets alumni are current team leaders.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">College Exposure</h3>
                <p className="text-muted-foreground">
                  14U teams attend showcase tournaments with college scouts. Several alumni have received scholarships to Division I-III programs.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Competitive Schedule</h3>
                <p className="text-muted-foreground">40-50 games per season including 5-8 weekend tournaments. April through July season.</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center">
                  <Rocket className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Player Development</h3>
                <p className="text-muted-foreground">
                  Advanced training in hitting mechanics, pitching development, defensive positioning, and mental game preparation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tryout Information */}
        <section id="tryouts" className="py-16 bg-background scroll-mt-20">
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
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold mb-1">Tryouts for the 2027 season will take place in July 2026.</p>
                      <p className="text-muted-foreground">Specific dates and registration information will be announced in early 2026. Check back for updates!</p>
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
                  <p className="text-muted-foreground mb-4">
                    Players are evaluated on:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• <strong>Hitting:</strong> Bat speed, contact consistency, power potential</li>
                    <li>• <strong>Fielding:</strong> Hands, footwork, arm strength, accuracy</li>
                    <li>• <strong>Speed:</strong> Base running instincts</li>
                    <li>• <strong>Throwing:</strong> Velocity, accuracy from position</li>
                    <li>• <strong>Game Awareness:</strong> Baseball IQ, coachability, attitude</li>
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
                <strong>Questions?</strong> Contact our Travel Coordinator at <a href="mailto:travel@cdbaseball.org" className="text-primary hover:underline">travel@cdbaseball.org</a>
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Launch Your Baseball Career</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join the CDBL Rockets and take your game to the next level. Future stars start here.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="default" size="lg" asChild className="bg-white text-primary hover:bg-white/90 shadow-lg font-semibold">
                <a href="#tryouts">View Tryout Information</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>;
};
export default Travel;
