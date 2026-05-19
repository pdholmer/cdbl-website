import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const InHouseTeams = () => {
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
            <h1 className="text-4xl md:text-6xl font-bold mb-6">In-House Teams & Divisions</h1>
            <p className="text-xl max-w-2xl">Recreational baseball teams organized by age, wearing proud MLB team names from the Cardinals to the Yankees.</p>
          </div>
        </section>

        {/* Registration Reminder */}
        <section className="py-16 bg-background">
          <div className="container">
            <div className="mb-12 p-6 bg-muted/40 rounded-lg border border-border max-w-4xl mx-auto">
              <h3 className="text-xl font-bold mb-2 text-center">2026 Season Underway</h3>
              <p className="text-center text-muted-foreground">
                Registration for the 2026 season is closed. Registration for 2027 will open later this year — check back for dates.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-4">In-House League Divisions</h2>
              <p className="text-muted-foreground max-w-3xl mb-4">
                Our In-House program features recreational teams organized by age division. Teams are formed based on age, skill level, and availability to ensure balanced, competitive play.
              </p>
              <Button variant="outline" asChild size="sm">
                <Link to="/new-to-cdbl">New to CDBL? Start Here →</Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>T-Ball Division</CardTitle>
                  <CardDescription>Ages 4-6 • Tee Ball</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground">TEAMS</p>
                      <p className="text-lg">8 Teams</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground">SEASON</p>
                      <p className="text-lg">April - June 2026</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground">TIME COMMITMENT</p>
                      <p className="text-sm">1 practice + 1 game/week (Saturdays)</p>
                    </div>
                    <p className="text-sm text-muted-foreground pt-2">
                      Introduction to baseball fundamentals with emphasis on fun and learning. Players hit off a tee, learn basic throwing and fielding skills.
                    </p>
                    <Button variant="link" asChild className="p-0 h-auto text-primary">
                      <Link to="/in-house/rules">View Rules & Policies →</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pinto Division</CardTitle>
                  <CardDescription>Ages 7-8 • Coach Pitch</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground">TEAMS</p>
                      <p className="text-lg">10 Teams</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground">SEASON</p>
                      <p className="text-lg">April - June 2026</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground">TIME COMMITMENT</p>
                      <p className="text-sm">2 practices + 1-2 games/week</p>
                    </div>
                    <p className="text-sm text-muted-foreground pt-2">
                      Coach pitch baseball developing hitting and fielding skills. Games typically weeknights (6pm) and Saturdays.
                    </p>
                    <Button variant="link" asChild className="p-0 h-auto text-primary">
                      <Link to="/in-house/rules">View Rules & Policies →</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mustang Division</CardTitle>
                  <CardDescription>Ages 9-10 • Player Pitch</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground">TEAMS</p>
                      <p className="text-lg">10 Teams</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground">SEASON</p>
                      <p className="text-lg">April - June 2026</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground">TIME COMMITMENT</p>
                      <p className="text-sm">2 practices + 1-2 games/week</p>
                    </div>
                    <p className="text-sm text-muted-foreground pt-2">
                      Player pitch baseball with focus on game strategy, teamwork, and advanced fundamentals. Pitch counts enforced for player safety.
                    </p>
                    <Button variant="link" asChild className="p-0 h-auto text-primary">
                      <Link to="/in-house/rules">View Rules & Policies →</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bronco Division</CardTitle>
                  <CardDescription>Ages 11-12 • Player Pitch</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground">TEAMS</p>
                      <p className="text-lg">12 Teams</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground">SEASON</p>
                      <p className="text-lg">April - June 2026</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground">TIME COMMITMENT</p>
                      <p className="text-sm">2 practices + 1-2 games/week</p>
                    </div>
                    <p className="text-sm text-muted-foreground pt-2">
                      Player pitch baseball with focus on game strategy, teamwork, and advanced fundamentals. Pitch counts enforced for player safety.
                    </p>
                    <Button variant="link" asChild className="p-0 h-auto text-primary">
                      <Link to="/in-house/rules">View Rules & Policies →</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pony Division</CardTitle>
                  <CardDescription>Ages 13-14 • Player Pitch</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground">TEAMS</p>
                      <p className="text-lg">10 Teams</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground">SEASON</p>
                      <p className="text-lg">April - July 2026</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground">TIME COMMITMENT</p>
                      <p className="text-sm">2 practices + 2 games/week</p>
                    </div>
                    <p className="text-sm text-muted-foreground pt-2">
                      Advanced skills with increased competitive play. Strict pitch counts and proper mechanics emphasized.
                    </p>
                    <Button variant="link" asChild className="p-0 h-auto text-primary">
                      <Link to="/in-house/rules">View Rules & Policies →</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>

        {/* MLB Team Names Section */}
        <section className="py-16 bg-muted/30">
          <div className="container max-w-4xl">
            <h2 className="text-3xl font-bold mb-6 text-center">Play for Your Favorite MLB Team!</h2>
            <p className="text-muted-foreground text-center mb-8">
              All In-House teams are named after Major League Baseball teams. Whether it's the Cardinals, Cubs, Dodgers, Yankees, or Red Sox, 
              every player gets to wear their favorite team's colors and name with pride!
            </p>
            <div className="text-center">
              <Button size="lg" variant="hero" asChild>
                <Link to="/in-house/registration">Register for In-House Baseball</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default InHouseTeams;