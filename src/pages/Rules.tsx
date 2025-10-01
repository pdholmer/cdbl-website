import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, BookOpen } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Rules = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary-light py-20 text-primary-foreground">
          <div className="container">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Rules & Policies</h1>
            <p className="text-xl max-w-2xl">League constitution, playing rules, and policies for all CDBL programs.</p>
          </div>
        </section>

        {/* Main Documents */}
        <section className="py-16 bg-background">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">League Documents</h2>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
              <Card>
                <CardHeader>
                  <FileText className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-2xl">CDBL Constitution</CardTitle>
                  <CardDescription>League bylaws and organizational structure</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    The official CDBL constitution outlines our league's mission, governance structure, board responsibilities, and operational procedures. Revised May 2024.
                  </p>
                  <Button 
                    size="lg" 
                    className="w-full"
                    onClick={() => window.open('https://www.cdbaseball.org/page/show/8348856-cdbl-constitution', '_blank')}
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    View Constitution
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <FileText className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-2xl">HR Derby Rules</CardTitle>
                  <CardDescription>Home run derby competition rules</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    Rules and scoring system for CDBL home run derby competitions held at all division levels at Plato Fields.
                  </p>
                  <Button 
                    size="lg" 
                    className="w-full"
                    onClick={() => window.open('https://www.cdbaseball.org/page/show/8348831-hr-derby-rules', '_blank')}
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    View HR Derby Rules
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Division Rules */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Division-Specific Rules</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>T-Ball (5-6 Years Old)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Games: 1 hour 15 minutes</li>
                    <li>• No official score kept</li>
                    <li>• All players bat each inning</li>
                    <li>• Coach pitch + tee</li>
                    <li>• All players in field</li>
                    <li>• Focus on fun and fundamentals</li>
                  </ul>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4" 
                    size="sm"
                    onClick={() => window.open('https://www.cdbaseball.org/page/show/8354151-tball-rules', '_blank')}
                  >
                    View T-Ball Rules
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pinto (7-8 Years Old)</CardTitle>
                  <CardDescription>1st & 2nd Graders</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Games: 1 hour 45 minutes</li>
                    <li>• Coach pitch format</li>
                    <li>• Noncompetitive/transitional</li>
                    <li>• Continuous batting order</li>
                    <li>• 5 runs max per inning</li>
                    <li>• Building on T-Ball skills</li>
                  </ul>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4" 
                    size="sm"
                    onClick={() => window.open('https://www.cdbaseball.org/page/show/8354273-pinto-rules', '_blank')}
                  >
                    View Pinto Rules
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mustang (9-10 Years Old)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Games: 2 hours (1:45 if double header)</li>
                    <li>• Player pitch introduced</li>
                    <li>• Stealing allowed (not home)</li>
                    <li>• 10 run mercy after 4 innings</li>
                    <li>• Pitch count regulations</li>
                    <li>• Competitive play begins</li>
                  </ul>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4" 
                    size="sm"
                    onClick={() => window.open('https://www.cdbaseball.org/page/show/8354297-mustang-rules', '_blank')}
                  >
                    View Mustang Rules
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bronco (11-12 Years Old)</CardTitle>
                  <CardDescription>5th & 6th Graders</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Games: 2 hours</li>
                    <li>• Player pitch (60' / 45')</li>
                    <li>• Full stealing rules</li>
                    <li>• 10 run mercy after 4 innings</li>
                    <li>• Leading off allowed</li>
                    <li>• Strict pitch count limits</li>
                  </ul>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4" 
                    size="sm"
                    onClick={() => window.open('https://www.cdbaseball.org/page/show/8355440-bronco-rules', '_blank')}
                  >
                    View Bronco Rules
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Key Policies */}
        <section className="py-16 bg-background">
          <div className="container max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">League Policies</h2>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <BookOpen className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Code of Conduct</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    All players, parents, coaches, and spectators are expected to demonstrate good sportsmanship and respect at all times. CDBL maintains a zero-tolerance policy for abusive behavior.
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Respect umpires, coaches, and players</li>
                    <li>• No profanity or abusive language</li>
                    <li>• Support all players, not just your child</li>
                    <li>• Follow ejection and suspension procedures</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Playing Time Policy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    CDBL is committed to fair and equitable playing time for all registered players in our In-House program.
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• All players play minimum 3 innings per game</li>
                    <li>• No player sits consecutive innings</li>
                    <li>• Playing time tracked by coaches</li>
                    <li>• Travel teams have different standards</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weather & Cancellation Policy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Games may be postponed or cancelled due to weather. Field status updates are posted on Sports Connect and social media.
                  </p>
                  <ul className="space-y-2 text-muted-foreground mb-4">
                    <li>• Coaches notified of cancellations</li>
                    <li>• Check Sports Connect for field status</li>
                    <li>• Makeup games scheduled when possible</li>
                    <li>• Safety is our top priority</li>
                  </ul>
                  <button
                    onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2224586', '_blank')}
                    className="text-primary hover:text-primary/80 font-semibold underline"
                  >
                    View Field Status →
                  </button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Refund & Transfer Policy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Registration fees are non-refundable after the draft date. Medical exceptions may be considered with documentation.
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• No refunds after draft/team assignment</li>
                    <li>• Transfers considered before season start</li>
                    <li>• Medical exceptions require documentation</li>
                    <li>• Contact treasurer for special circumstances</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Safety & Equipment Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Player safety is paramount. All players must wear appropriate protective equipment as outlined in division rules.
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Batting helmets required at all times</li>
                    <li>• Catchers must wear full gear</li>
                    <li>• Athletic supporter with cup recommended</li>
                    <li>• Metal cleats prohibited (except Colt)</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact for Questions */}
        <section className="py-16 bg-muted/30">
          <div className="container max-w-2xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Questions About Rules?</h2>
            <p className="text-muted-foreground mb-8">
              If you have questions about CDBL rules or policies, please contact our Player Agent or reach out to any board member.
            </p>
            <Button size="lg" variant="hero">
              Contact Us
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Rules;