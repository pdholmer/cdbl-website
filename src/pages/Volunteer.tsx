import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Heart, ClipboardCheck, Megaphone, Wrench, DollarSign } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Volunteer = () => {
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
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Volunteer & Support</h1>
            <p className="text-xl max-w-2xl">CDBL runs on community support. Join our team of dedicated volunteers making a difference!</p>
          </div>
        </section>

        {/* Why Volunteer */}
        <section className="py-16 bg-background">
          <div className="container max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Why Volunteer with CDBL?</h2>
            <p className="text-lg text-muted-foreground text-center mb-12">
              CDBL is a 100% volunteer-run organization. Every hour you contribute directly impacts the experience of our 400+ young athletes. Whether you have baseball expertise or just want to help out, there's a place for you!
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Heart className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">Make an Impact</h3>
                  <p className="text-muted-foreground text-sm">Shape young lives through sports and mentorship</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <Users className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">Build Community</h3>
                  <p className="text-muted-foreground text-sm">Connect with other families and create lasting friendships</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <ClipboardCheck className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">Flexible Options</h3>
                  <p className="text-muted-foreground text-sm">Choose roles that fit your schedule and interests</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Volunteer Opportunities */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Volunteer Opportunities</h2>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              <Card>
                <CardHeader>
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-2xl">Coaching</CardTitle>
                  <CardDescription>Lead and mentor a team of players</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Be a head coach or assistant coach. No prior coaching experience required—we provide training and support! Coaches have the greatest impact on player development.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                    <li>• Head Coaches (all divisions)</li>
                    <li>• Assistant Coaches</li>
                    <li>• Practice helpers</li>
                    <li>• Pitching/hitting instructors</li>
                  </ul>
                  <Button className="w-full">Sign Up to Coach</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Megaphone className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-2xl">Umpiring</CardTitle>
                  <CardDescription>Call the games and keep things fair</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Umpires are essential to every game. We need volunteers at all levels, from T-Ball to Colt. Training and equipment provided. Stipend available for higher divisions.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                    <li>• Game umpires (all divisions)</li>
                    <li>• Training provided</li>
                    <li>• Flexible scheduling</li>
                    <li>• Paid positions available</li>
                  </ul>
                  <Button className="w-full">Become an Umpire</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <ClipboardCheck className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-2xl">Field Operations</CardTitle>
                  <CardDescription>Help maintain our beautiful complex</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Keep our fields in top condition. Help with field prep, maintenance, and event setup. Perfect for those who prefer behind-the-scenes work.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                    <li>• Field preparation and lining</li>
                    <li>• Equipment maintenance</li>
                    <li>• Game day setup/breakdown</li>
                    <li>• Grounds keeping projects</li>
                  </ul>
                  <Button className="w-full" variant="outline">Join Field Crew</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Wrench className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-2xl">Event Support</CardTitle>
                  <CardDescription>Help run tournaments and special events</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Assist with Opening Day, tournaments, All-Star games, and other special events. Great one-time or occasional volunteer opportunity.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                    <li>• Tournament coordination</li>
                    <li>• Concession stand help</li>
                    <li>• Registration & check-in</li>
                    <li>• Photography and videography</li>
                  </ul>
                  <Button className="w-full" variant="outline">Help With Events</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Megaphone className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-2xl">Team Parent</CardTitle>
                  <CardDescription>Coordinate team communication and activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Be the liaison between coaches and families. Organize team activities, manage schedules, and coordinate snack rotations.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                    <li>• Team communication</li>
                    <li>• Snack schedule coordination</li>
                    <li>• End-of-season party planning</li>
                    <li>• Team photo organization</li>
                  </ul>
                  <Button className="w-full" variant="outline">Volunteer as Team Parent</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <ClipboardCheck className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-2xl">Board Positions</CardTitle>
                  <CardDescription>Lead CDBL at the organizational level</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Board members guide CDBL's strategic direction, manage operations, and ensure we're serving our community. Elections held annually.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                    <li>• President, VP, Treasurer, Secretary</li>
                    <li>• Player Agent</li>
                    <li>• Division Coordinators</li>
                    <li>• Committee chairs</li>
                  </ul>
                  <Button className="w-full" variant="outline">Learn About Board</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Support CDBL */}
        <section className="py-16 bg-background">
          <div className="container max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Support CDBL</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-2 border-primary">
                <CardHeader>
                  <DollarSign className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-2xl">Make a Donation</CardTitle>
                  <CardDescription>Financial support helps us grow and improve</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    Your tax-deductible donation helps fund field improvements, equipment purchases, scholarship programs, and keeps registration fees affordable for all families.
                  </p>
                  <ul className="space-y-2 text-muted-foreground mb-6">
                    <li>• 100% of donations go directly to the league</li>
                    <li>• Tax-deductible (501(c)(3) non-profit)</li>
                    <li>• Recognition opportunities available</li>
                    <li>• One-time or recurring options</li>
                  </ul>
                  <Button size="lg" className="w-full" variant="hero">
                    Donate Now
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary">
                <CardHeader>
                  <Users className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-2xl">Become a Sponsor</CardTitle>
                  <CardDescription>Partner with CDBL and gain visibility</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    Local businesses can sponsor teams, fields, or events. Sponsorships provide valuable funding while promoting your business to our community.
                  </p>
                  <ul className="space-y-2 text-muted-foreground mb-6">
                    <li>• Team sponsorships ($250-$500)</li>
                    <li>• Field banners and signage</li>
                    <li>• Tournament sponsorships</li>
                    <li>• Logo on website and materials</li>
                  </ul>
                  <Button size="lg" className="w-full" variant="outline">
                    Sponsorship Info
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Get Started */}
        <section className="py-16 bg-muted/30">
          <div className="container max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Involved?</h2>
            <p className="text-muted-foreground mb-8">
              Fill out our volunteer interest form and we'll connect you with the right opportunity. Every volunteer makes CDBL better!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="hero">
                Volunteer Interest Form
              </Button>
              <Button size="lg" variant="outline">
                Contact Volunteer Coordinator
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Volunteer;