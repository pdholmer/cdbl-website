import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Trophy, Target } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Teams = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary-light py-20 text-primary-foreground">
          <div className="container">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Teams & Rosters</h1>
            <p className="text-xl max-w-2xl">View all CDBL teams across our In-House and Travel programs.</p>
          </div>
        </section>

        {/* Teams Tabs */}
        <section className="py-16 bg-background">
          <div className="container">
            <Tabs defaultValue="in-house" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
                <TabsTrigger value="in-house">In-House Teams</TabsTrigger>
                <TabsTrigger value="travel">Travel Teams</TabsTrigger>
              </TabsList>

              <TabsContent value="in-house">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-4">In-House League</h2>
                  <p className="text-muted-foreground max-w-3xl">
                    Our In-House program features recreational teams organized by age division. Teams are formed based on age, skill level, and availability to ensure balanced, competitive play.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>T-Ball Division</CardTitle>
                      <CardDescription>Ages 4-6</CardDescription>
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
                        <p className="text-sm text-muted-foreground pt-2">Introduction to baseball fundamentals with emphasis on fun and learning.</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Pinto Division</CardTitle>
                      <CardDescription>Ages 7-8</CardDescription>
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
                        <p className="text-sm text-muted-foreground pt-2">Coach pitch baseball developing hitting and fielding skills.</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Bronco Division</CardTitle>
                      <CardDescription>Ages 9-10</CardDescription>
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
                        <p className="text-sm text-muted-foreground pt-2">Player pitch with focus on game strategy and teamwork.</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Pony Division</CardTitle>
                      <CardDescription>Ages 11-12</CardDescription>
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
                        <p className="text-sm text-muted-foreground pt-2">Advanced skills with increased competitive play.</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Colt Division</CardTitle>
                      <CardDescription>Ages 13-14</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="font-semibold text-sm text-muted-foreground">TEAMS</p>
                          <p className="text-lg">6 Teams</p>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-muted-foreground">SEASON</p>
                          <p className="text-lg">April - July 2026</p>
                        </div>
                        <p className="text-sm text-muted-foreground pt-2">Preparing players for high school baseball.</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="travel">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-4">CDBL Rockets Travel Program</h2>
                  <p className="text-muted-foreground max-w-3xl">
                    Our competitive travel teams represent CDBL in tournaments across the region. Tryouts are held annually, and teams compete at the highest level.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>8U Rockets</CardTitle>
                      <CardDescription>Born 2018-2019</CardDescription>
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
                      <CardDescription>Born 2016-2017</CardDescription>
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
                      <CardDescription>Born 2014-2015</CardDescription>
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
                      <CardDescription>Born 2012-2013</CardDescription>
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
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Info Cards */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <Users className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Team Rosters</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Full team rosters will be available after drafts are complete in March 2026. Check back soon!</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Target className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Coaching Staff</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Interested in coaching? We're always looking for dedicated volunteers to help lead our teams.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Trophy className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Team Photos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Team and individual photos will be taken during the season. Photo day details coming soon!</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Teams;