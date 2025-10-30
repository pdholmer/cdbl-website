import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Rocket, Trophy, Target, Calendar, DollarSign, Star, TrendingUp, Award } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import rocketLogo from "@/assets/rocket-white-2.png";
import chsLogo from "@/assets/chs-rocket.png";
import rocketWhite3 from "@/assets/rocket-white-3.png";
import heroTravelTeams from "@/assets/hero-travel-teams.jpg";
const Travel = () => {
  const teams = [{
    age: "8U",
    record: "Regional Champions 2025",
    coach: "Mike Stevens"
  }, {
    age: "10U",
    record: "State Tournament Qualifier",
    coach: "Jennifer Martinez"
  }, {
    age: "12U",
    record: "Conference Champions",
    coach: "Robert Chen"
  }, {
    age: "14U",
    record: "Elite Division Finalists",
    coach: "David Thompson"
  }];
  return <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section - Rockets Theme */}
        <section className="relative py-16 md:py-24 text-primary-foreground overflow-hidden bg-cover bg-center sm:bg-center md:bg-[65%_center]" style={{
        backgroundImage: `linear-gradient(to right, hsla(215, 100%, 26%, 0.9) 0%, hsla(201, 63%, 56%, 0.1) 100%), url('${heroTravelTeams}')`
      }}>
          <div className="container">
            <div className="flex items-center gap-4 mb-6">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold">CDBL Rockets</h1>
                <p className="text-xl opacity-90">The Future Starts Here</p>
              </div>
              <img src={rocketLogo} alt="CDBL Rockets" className="h-16 w-auto" />
            </div>
            <p className="text-xl mb-8 max-w-2xl">Elite travel baseball program building the pipeline to Burlington Central High School and beyond.</p>
            <div className="flex flex-wrap gap-4">
              <Button variant="default" size="lg" asChild className="bg-white text-primary hover:bg-white/90 shadow-lg font-semibold">
                <Link to="/in-house-registration">Register for In-House Season</Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-carolina hover:border-white font-semibold">
                <Link to="/in-house">Learn About In-House</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Future Stars Section */}
        <section className="py-16 bg-background">
          <div className="container">
            <div className="text-center mb-12">
              <img src={chsLogo} alt="Central High School Rockets" className="h-16 w-auto mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Building Future Rockets</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our travel program creates a direct pipeline to Burlington Central High School (District 301), 
                developing elite players who go on to compete at the highest levels.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {teams.map(team => <Card key={team.age} className="text-center border-2 border-primary/20 hover:border-primary transition-colors">
                  <CardHeader>
                    <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center bg-gradient-to-br from-primary to-accent">
                      <Star className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{team.age}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm font-semibold text-primary">{team.record}</p>
                    <p className="text-xs text-muted-foreground">Coach: {team.coach}</p>
                  </CardContent>
                </Card>)}
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
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">College Exposure</h3>
                <p className="text-muted-foreground">
                  14U teams attend showcase tournaments with college scouts. Several alumni have received scholarships to Division I-III programs.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center">
                  <Award className="h-8 w-8 text-white" />
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
        <section className="py-16 bg-background">
          <div className="container max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Tryout Information</h2>
            
            <div className="space-y-6">
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                <CardHeader>
                  <CardTitle className="text-2xl">2027 Season Tryouts</CardTitle>
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
                      <li>• 2-3 practices per week (weeknights)</li>
                      <li>• 2-3 games per week during season</li>
                      <li>• 8-15 weekend tournaments (overnight travel)</li>
                      <li>• Season: March - August (6 months)</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Financial Investment</p>
                    <ul className="text-muted-foreground space-y-1 ml-4">
                      <li>• Registration fee: ~$600</li>
                      <li>• Tournament fees: $1,500-$2,500</li>
                      <li>• Travel expenses: Hotels, meals, gas</li>
                      <li>• Total typical cost: $2,500-$3,500 per season</li>
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
              <p className="text-muted-foreground mt-4">
                <strong>Questions?</strong> Contact our Travel Coordinator at travel@cdbl.org
              </p>
            </div>

            <div className="mt-12 text-center">
              <Button variant="default" size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg font-semibold">
                <Link to="/in-house-registration">Register for In-House Season</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container text-center">
            <img src={rocketWhite3} alt="CDBL Rockets" className="h-16 w-auto mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Launch Your Baseball Career</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join the CDBL Rockets and take your game to the next level. Future stars start here.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="default" size="lg" asChild className="bg-white text-primary hover:bg-white/90 shadow-lg font-semibold">
                <Link to="/in-house-registration">Register for In-House Season</Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-carolina hover:border-white font-semibold">
                <Link to="/in-house">Learn About In-House</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>;
};
export default Travel;