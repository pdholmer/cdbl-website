import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Trophy, Star } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import rocketLogo from "@/assets/rocket-white-2.png";
import heroActionBg from "@/assets/hero-action-bg.jpg";

const TravelTeams = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section 
          className="relative py-16 md:py-24 text-primary-foreground overflow-hidden"
          style={{ 
            background: `linear-gradient(135deg, hsl(215 100% 26% / 0.95) 0%, hsl(201 63% 56% / 0.9) 100%), url(${heroActionBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="container">
            <div className="flex items-center gap-4 mb-6">
              <img src={rocketLogo} alt="CDBL Rockets" className="h-16 w-auto" />
              <h1 className="text-4xl md:text-6xl font-bold">Rockets Travel Teams</h1>
            </div>
            <p className="text-xl max-w-2xl">Elite competitive teams representing CDBL in regional tournaments.</p>
          </div>
        </section>

        {/* Teams Section */}
        <section className="py-16 bg-background">
          <div className="container">
            <div className="mb-12 p-6 bg-primary/10 rounded-lg border border-primary/20 max-w-4xl mx-auto">
              <h3 className="text-xl font-bold mb-2 text-center">2026 Travel Tryouts</h3>
              <p className="text-center text-muted-foreground mb-4">
                <strong>Tryout Dates:</strong> March 8-9, 2026 • <strong>Team Announcements:</strong> March 10, 2026
              </p>
              <div className="flex justify-center">
                <Button asChild>
                  <Link to="/travel/registration">Register for Tryouts</Link>
                </Button>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-8 text-center">CDBL Rockets Travel Teams</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Our competitive travel teams represent CDBL in tournaments across the region. Tryouts are held annually, and teams compete at the highest level.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle>8U Rockets</CardTitle>
                  <p className="text-sm text-muted-foreground">Born 2018-2019</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-primary" />
                      <span className="text-sm">Regional Champions 2025</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground">HEAD COACH</p>
                      <p>Mike Johnson</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground">TOURNAMENTS</p>
                      <p>8-10 per season</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>10U Rockets</CardTitle>
                  <p className="text-sm text-muted-foreground">Born 2016-2017</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-primary" />
                      <span className="text-sm">State Qualifier 2025</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground">HEAD COACH</p>
                      <p>Dave Martinez</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground">TOURNAMENTS</p>
                      <p>10-12 per season</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>12U Rockets</CardTitle>
                  <p className="text-sm text-muted-foreground">Born 2014-2015</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-primary" />
                      <span className="text-sm">State Tournament 2025</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground">HEAD COACH</p>
                      <p>Tom Anderson</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground">TOURNAMENTS</p>
                      <p>12-15 per season</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>14U Rockets</CardTitle>
                  <p className="text-sm text-muted-foreground">Born 2012-2013</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-primary" />
                      <span className="text-sm">Regional Finalist 2025</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground">HEAD COACH</p>
                      <p>Steve Roberts</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground">TOURNAMENTS</p>
                      <p>12-15 per season</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Team Success Section */}
        <section className="py-16 bg-muted/30">
          <div className="container max-w-4xl">
            <h2 className="text-3xl font-bold mb-8 text-center">2025 Season Highlights</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <Star className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Tournament Success</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• 8U Regional Championship</li>
                    <li>• 10U State Tournament Appearance</li>
                    <li>• 12U State Tournament Participant</li>
                    <li>• 14U Regional Finals</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Trophy className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Individual Honors</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• 12 All-Tournament Team selections</li>
                    <li>• 5 Players invited to showcase events</li>
                    <li>• Multiple Perfect Game ranking appearances</li>
                    <li>• 3 Players selected for elite travel teams</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* High School Pipeline */}
        <section className="py-16 bg-background">
          <div className="container max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-6">The Rockets Pipeline</h2>
            <p className="text-xl text-muted-foreground mb-8">
              CDBL Rockets → Burlington Central High School → College Baseball
            </p>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Many Rockets alumni have gone on to play varsity baseball at Burlington Central High School, 
              with several earning college scholarships. Our program prepares players for success at every level.
            </p>
            <Button size="lg" variant="hero" asChild>
              <Link to="/travel/registration">Join the Rockets</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TravelTeams;