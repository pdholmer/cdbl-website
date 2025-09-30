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
                    The official CDBL constitution outlines our league's mission, governance structure, board responsibilities, and operational procedures.
                  </p>
                  <Button size="lg" className="w-full">
                    <Download className="mr-2 h-5 w-5" />
                    Download Constitution (PDF)
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <FileText className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-2xl">Playing Rules</CardTitle>
                  <CardDescription>Complete rulebook for all divisions</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    Official playing rules for all CDBL divisions, including field dimensions, equipment requirements, and game procedures.
                  </p>
                  <Button size="lg" className="w-full">
                    <Download className="mr-2 h-5 w-5" />
                    Download Rulebook (PDF)
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
                  <CardTitle>T-Ball (Ages 4-6)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Games: 4 innings or 60 minutes</li>
                    <li>• No score kept</li>
                    <li>• All players bat each inning</li>
                    <li>• No stealing or leadoffs</li>
                    <li>• Tee batting only</li>
                    <li>• Focus on fun and fundamentals</li>
                  </ul>
                  <Button variant="outline" className="w-full mt-4" size="sm">
                    View T-Ball Rules
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pinto (Ages 7-8)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Games: 6 innings or 1.5 hours</li>
                    <li>• Coach pitch format</li>
                    <li>• 10 run mercy rule</li>
                    <li>• Continuous batting order</li>
                    <li>• No stealing home</li>
                    <li>• Maximum 5 runs per inning</li>
                  </ul>
                  <Button variant="outline" className="w-full mt-4" size="sm">
                    View Pinto Rules
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bronco (Ages 9-10)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Games: 6 innings or 2 hours</li>
                    <li>• Player pitch (60' / 45')</li>
                    <li>• Stealing allowed</li>
                    <li>• 10 run mercy after 4 innings</li>
                    <li>• Standard baseball rules apply</li>
                    <li>• Pitch count regulations</li>
                  </ul>
                  <Button variant="outline" className="w-full mt-4" size="sm">
                    View Bronco Rules
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pony (Ages 11-12)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Games: 6 innings or 2 hours</li>
                    <li>• Player pitch (70' / 50')</li>
                    <li>• Full stealing rules</li>
                    <li>• 10 run mercy after 4 innings</li>
                    <li>• Leading off allowed</li>
                    <li>• Strict pitch count limits</li>
                  </ul>
                  <Button variant="outline" className="w-full mt-4" size="sm">
                    View Pony Rules
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Colt (Ages 13-14)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Games: 7 innings or 2.5 hours</li>
                    <li>• Player pitch (80' / 60')</li>
                    <li>• High school rules adapted</li>
                    <li>• Metal cleats allowed</li>
                    <li>• Pitch count & rest rules</li>
                    <li>• Protest procedures apply</li>
                  </ul>
                  <Button variant="outline" className="w-full mt-4" size="sm">
                    View Colt Rules
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Travel Teams</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Tournament specific rules</li>
                    <li>• USSSA / AAU regulations</li>
                    <li>• Advanced pitching rules</li>
                    <li>• Equipment requirements</li>
                    <li>• Code of conduct</li>
                    <li>• Travel team policies</li>
                  </ul>
                  <Button variant="outline" className="w-full mt-4" size="sm">
                    View Travel Rules
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
                    Games may be postponed or cancelled due to weather. Field status updates are posted on our website and social media.
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Coaches notified of cancellations</li>
                    <li>• Check website for field status</li>
                    <li>• Makeup games scheduled when possible</li>
                    <li>• Safety is our top priority</li>
                  </ul>
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