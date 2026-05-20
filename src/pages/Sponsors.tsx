import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Award, TrendingUp, Users } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const tiers = [
  {
    name: "Grand Slam",
    amount: "$700",
    sponsors: [
      "Climate Control Services",
      "Five Star Concrete",
      "Klein Baseball",
      "Kleins Market",
      "Koertgen/Currey ReMAX",
      "Kustom Heating",
      "Layne Christensen",
      "Paramount Fence",
      "Radiant Eye Care",
      "Realty of America – Jesus Perez",
      "Spike's Auto Recycling",
      "State Farm – Tony Mensik",
      "Village Squire",
      "Wired Up Party Zone",
    ],
  },
  {
    name: "Home Run",
    amount: "$500",
    sponsors: [
      "Armond Chauffer Service",
      "Baird Private Wealth Mgmt – Bingaman",
      "Floor Coverings International",
      "Suburban Life Realty",
      "Tim Metz Farming",
      "Top Shelf Sports Cards",
    ],
  },
  {
    name: "Double",
    amount: "$250",
    sponsors: [
      "Baird & Warner Real Estate – Susan Price",
      "Brittain's Express Oil & Lube",
      "Niko's Tavern",
      "Pakk Electric",
    ],
  },
];

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

        {/* Sponsor Tiers */}
        {tiers.map((tier, tierIndex) => (
          <section
            key={tier.name}
            className={`py-16 ${tierIndex % 2 === 0 ? "bg-muted/30" : "bg-background"}`}
          >
            <div className="container">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-3">{tier.name}</h2>
                <p className="text-2xl md:text-3xl font-bold text-primary">{tier.amount}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
                {tier.sponsors.map((sponsor) => (
                  <div
                    key={sponsor}
                    className="bg-card rounded-lg p-4 text-center border"
                  >
                    <p className="text-sm md:text-base font-semibold">{sponsor}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}

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
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Partner With CDBL</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join our community of sponsors supporting youth baseball in Burlington. Contact us to learn more about sponsorship opportunities and custom packages.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                variant="default"
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-lg font-semibold"
                asChild
              >
                <a href="mailto:sponsorships@cdbaseball.org">Become a Sponsor</a>
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
