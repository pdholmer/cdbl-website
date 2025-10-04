import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Award, TrendingUp, Users } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Sponsors = () => {
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
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Our Sponsors</h1>
            <p className="text-xl max-w-2xl">Thank you to our amazing sponsors who make CDBL possible!</p>
          </div>
        </section>

        {/* Thank You Section */}
        <section className="py-16 bg-background">
          <div className="container max-w-4xl text-center">
            <Heart className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">A Heartfelt Thank You</h2>
            <p className="text-lg text-muted-foreground mb-8">
              CDBL would not be possible without the generous support of our local business partners and community sponsors. Their contributions help us maintain our facilities, purchase equipment, keep registration fees affordable, and provide the best possible baseball experience for our youth.
            </p>
          </div>
        </section>

        {/* Premier Sponsors */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Premier Sponsors</h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="text-center">
                <CardContent className="pt-8 pb-8">
                  <div className="bg-muted h-32 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-muted-foreground font-semibold">Sponsor Logo</span>
                  </div>
                  <h3 className="font-bold text-xl mb-2">Burlington Bank & Trust</h3>
                  <p className="text-sm text-muted-foreground">Proud supporter since 2010</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-8 pb-8">
                  <div className="bg-muted h-32 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-muted-foreground font-semibold">Sponsor Logo</span>
                  </div>
                  <h3 className="font-bold text-xl mb-2">Miller's Hardware</h3>
                  <p className="text-sm text-muted-foreground">Field sponsor since 2015</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-8 pb-8">
                  <div className="bg-muted h-32 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-muted-foreground font-semibold">Sponsor Logo</span>
                  </div>
                  <h3 className="font-bold text-xl mb-2">Joe's Pizza & Grill</h3>
                  <p className="text-sm text-muted-foreground">Tournament sponsor</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Gold Sponsors */}
        <section className="py-16 bg-background">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Gold Sponsors</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                "Smith Family Dentistry",
                "Burlington Auto Sales",
                "Valley Insurance Agency",
                "Peterson Construction",
                "Main Street Pharmacy",
                "Anderson Realty Group",
                "Central IL Landscaping",
                "Wilson's Sporting Goods"
              ].map((sponsor, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6 pb-6">
                    <div className="bg-muted h-20 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">Logo</span>
                    </div>
                    <p className="font-semibold text-sm">{sponsor}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Sponsors */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Team Sponsors</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              These local businesses have generously sponsored individual teams, helping provide jerseys, equipment, and support for our players.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {[
                "Riverside Family Restaurant",
                "Thompson HVAC Services",
                "Quality Auto Repair",
                "Burlington Veterinary Clinic",
                "First State Bank",
                "Green Thumb Garden Center",
                "Elite Fitness Center",
                "Family Chiropractic Care",
                "Burlington Ace Hardware",
                "Sunrise Bakery",
                "Mitchell Law Offices",
                "Valley View Farm Supply",
                "Hometown Insurance",
                "Pro Tech Computer Services",
                "Country Kitchen Restaurant",
                "Central Dental Associates"
              ].map((sponsor, index) => (
                <div key={index} className="bg-card rounded-lg p-4 text-center border">
                  <p className="text-sm font-semibold">{sponsor}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sponsorship Benefits */}
        <section className="py-16 bg-background">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Become a Sponsor</h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
              <Card>
                <CardHeader>
                  <TrendingUp className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Community Visibility</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Your business will be prominently displayed to hundreds of families throughout the season at games, events, and tournaments.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Support Youth Sports</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Make a direct impact on local youth by supporting healthy activities, teamwork, and character development through baseball.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Award className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Tax Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    As a 501(c)(3) non-profit, your sponsorship is tax-deductible. We'll provide documentation for your records.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sponsorship Levels */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card className="border-2 border-primary">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Team Sponsor</CardTitle>
                  <p className="text-3xl font-bold text-primary mt-2">$250</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Team name sponsorship</li>
                    <li>• Logo on team banner</li>
                    <li>• Recognition on website</li>
                    <li>• Social media mentions</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Field Sponsor</CardTitle>
                  <p className="text-3xl font-bold text-primary mt-2">$500</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• All Team Sponsor benefits</li>
                    <li>• Large field banner (full season)</li>
                    <li>• Featured on field signage</li>
                    <li>• Newsletter recognition</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Premier Sponsor</CardTitle>
                  <p className="text-3xl font-bold text-primary mt-2">$1,000+</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• All Field Sponsor benefits</li>
                    <li>• Premium website placement</li>
                    <li>• Tournament naming rights</li>
                    <li>• Custom recognition package</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-muted/30">
          <div className="container max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Partner With CDBL</h2>
            <p className="text-muted-foreground mb-8">
              Join our community of sponsors supporting youth baseball in Burlington. Contact us to learn more about sponsorship opportunities and custom packages.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="hero">
                Become a Sponsor
              </Button>
              <Button size="lg" variant="outline">
                Download Sponsorship Packet
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Sponsors;