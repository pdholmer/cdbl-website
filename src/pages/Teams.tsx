import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Users, Trophy, Target, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Teams = () => {
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
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Teams & Rosters</h1>
            <p className="text-xl max-w-2xl">View all CDBL teams across our In-House and Travel programs.</p>
          </div>
        </section>

        {/* Teams Tabs */}
        <section className="py-16 bg-background">
          <div className="container">
            {/* Registration Reminder Banner */}
            <div className="mb-12 p-6 bg-primary/10 rounded-lg border border-primary/20 max-w-4xl mx-auto">
              <h3 className="text-xl font-bold mb-2 text-center">2026 Registration Now Open!</h3>
              <p className="text-center text-muted-foreground mb-4">
                <strong>Early Registration:</strong> December 1, 2025 • <strong>Regular:</strong> January 15, 2026 • <strong>Late:</strong> March 1, 2026
              </p>
              <div className="flex justify-center">
                <Button asChild>
                  <Link to="/registration">Register Now</Link>
                </Button>
              </div>
            </div>

            <Tabs defaultValue="in-house" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
                <TabsTrigger value="in-house">In-House Teams</TabsTrigger>
                <TabsTrigger value="travel">Travel Teams</TabsTrigger>
              </TabsList>

              <TabsContent value="in-house">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-4">In-House League</h2>
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
                          <Link to="/rules">View Rules & Policies →</Link>
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
                          <Link to="/rules">View Rules & Policies →</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Bronco Division (formerly Mustang)</CardTitle>
                      <CardDescription>Ages 9-10 • Player Pitch</CardDescription>
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
                          <Link to="/rules">View Rules & Policies →</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Pony Division</CardTitle>
                      <CardDescription>Ages 11-12 • Player Pitch</CardDescription>
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
                          <Link to="/rules">View Rules & Policies →</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Colt Division</CardTitle>
                      <CardDescription>Ages 13-14 • Player Pitch</CardDescription>
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
                        <div>
                          <p className="font-semibold text-sm text-muted-foreground">TIME COMMITMENT</p>
                          <p className="text-sm">2-3 practices + 2 games/week</p>
                        </div>
                        <p className="text-sm text-muted-foreground pt-2">
                          Preparing players for high school baseball with advanced strategy, conditioning, and competitive play.
                        </p>
                        <Button variant="link" asChild className="p-0 h-auto text-primary">
                          <Link to="/rules">View Rules & Policies →</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="travel">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-4">CDBL Rockets Travel Program</h2>
                  <p className="text-muted-foreground max-w-3xl mb-4">
                    Our competitive travel teams represent CDBL in tournaments across the region. Tryouts are held annually, and teams compete at the highest level.
                  </p>
                  <Button variant="outline" asChild size="sm">
                    <Link to="/registration">Travel Registration & Tryouts →</Link>
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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

                {/* Travel Tryout Information */}
                <div className="mt-12 space-y-8">
                  <div className="max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold mb-6 text-center">Travel Tryout Information</h3>
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      <Card className="bg-primary/5">
                        <CardHeader>
                          <CardTitle>Tryout Schedule</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3 text-sm">
                            <div className="p-3 bg-card rounded-lg">
                              <p className="font-semibold mb-1">Saturday, March 8, 2026</p>
                              <p className="text-muted-foreground">8U & 10U: 9:00 AM - 12:00 PM</p>
                              <p className="text-muted-foreground">12U & 14U: 1:00 PM - 4:00 PM</p>
                            </div>
                            <div className="p-3 bg-card rounded-lg">
                              <p className="font-semibold mb-1">Sunday, March 9, 2026</p>
                              <p className="text-muted-foreground">Callback sessions (invitation only)</p>
                              <p className="text-muted-foreground">Times TBD based on Saturday results</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-3">
                              Location: CDBL Main Complex, Championship Field
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-primary/5">
                        <CardHeader>
                          <CardTitle>What to Bring</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <span className="text-primary font-bold">•</span>
                              <span>Baseball glove (well broken in)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-primary font-bold">•</span>
                              <span>Bat (or use provided bats)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-primary font-bold">•</span>
                              <span>Batting helmet with cage</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-primary font-bold">•</span>
                              <span>Cleats (turf or molded)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-primary font-bold">•</span>
                              <span>Athletic cup (required)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-primary font-bold">•</span>
                              <span>Water bottle & snacks</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-primary font-bold">•</span>
                              <span>Completed tryout registration form</span>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Tryout Evaluation Process</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">
                          Players will be evaluated in the following areas. Each coach will score players independently, and scores are combined to create balanced teams:
                        </p>
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="font-semibold mb-2">Hitting</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• Batting stance & mechanics</li>
                              <li>• Contact consistency</li>
                              <li>• Power & bat speed</li>
                              <li>• Bunting ability</li>
                            </ul>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="font-semibold mb-2">Fielding</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• Ground ball mechanics</li>
                              <li>• Fly ball tracking</li>
                              <li>• Throwing accuracy</li>
                              <li>• Arm strength</li>
                            </ul>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="font-semibold mb-2">Pitching & Running</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• Pitching mechanics (if applicable)</li>
                              <li>• Speed & agility</li>
                              <li>• Base running instincts</li>
                              <li>• Overall athleticism</li>
                            </ul>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <strong>Note:</strong> Attitude, coachability, and hustle are also important factors. We're looking for players who love the game and are willing to learn and work hard.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-primary/10 border-primary/20 mt-6">
                      <CardHeader>
                        <CardTitle>Travel Team Commitment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">
                          Travel baseball is a significant commitment for both players and families. Before trying out, please ensure you understand the expectations:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-semibold mb-2">Time Commitment:</p>
                            <ul className="space-y-1 text-muted-foreground">
                              <li>• 2-3 practices per week (weeknights)</li>
                              <li>• 2-3 games per week (weeknights/weekends)</li>
                              <li>• 8-15 weekend tournaments (March-August)</li>
                              <li>• Year-round conditioning recommended</li>
                            </ul>
                          </div>
                          <div>
                            <p className="font-semibold mb-2">Financial Commitment:</p>
                            <ul className="space-y-1 text-muted-foreground">
                              <li>• ~$600 registration fee</li>
                              <li>• Tournament entry fees ($50-150 each)</li>
                              <li>• Travel expenses (hotels, gas, meals)</li>
                              <li>• Additional equipment as needed</li>
                            </ul>
                          </div>
                          <div>
                            <p className="font-semibold mb-2">Player Expectations:</p>
                            <ul className="space-y-1 text-muted-foreground">
                              <li>• Attend all practices & games</li>
                              <li>• Arrive 30 min early for warm-ups</li>
                              <li>• Maintain passing grades in school</li>
                              <li>• Represent CDBL with class</li>
                            </ul>
                          </div>
                          <div>
                            <p className="font-semibold mb-2">Parent Expectations:</p>
                            <ul className="space-y-1 text-muted-foreground">
                              <li>• Transport player to all activities</li>
                              <li>• Volunteer at fundraisers</li>
                              <li>• Support positive team culture</li>
                              <li>• Communicate with coaches</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Coach Resources */}
        <section className="py-16 bg-background">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Coach Resources</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
              Current and prospective coaches: Access rosters, schedules, and coaching materials through SportsConnect. Find practice plans, drill libraries, and helpful resources below.
            </p>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
              <Card>
                <CardHeader>
                  <Target className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Access SportsConnect</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    View your team roster, player contact info, schedule, and communicate with families through our league management system.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2121019', '_blank')}
                  >
                    Login to SportsConnect <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Important Dates for Coaches</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>March 8-9:</strong> Player Evaluations</li>
                    <li><strong>March 15:</strong> Draft Day</li>
                    <li><strong>March 20:</strong> Rosters Released</li>
                    <li><strong>Late March:</strong> First Team Practice</li>
                    <li><strong>April:</strong> Season Opens</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="p-6 bg-primary/10 rounded-lg max-w-3xl mx-auto mb-12">
              <h3 className="text-xl font-bold mb-4">Who to Contact</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold">Draft & Roster Questions:</p>
                  <p className="text-muted-foreground">Mike Chen, Player Agent</p>
                </div>
                <div>
                  <p className="font-semibold">Travel Team Issues:</p>
                  <p className="text-muted-foreground">Dave Martinez, Travel Coordinator</p>
                </div>
                <div>
                  <p className="font-semibold">Field Maintenance:</p>
                  <p className="text-muted-foreground">Contact via field status form</p>
                </div>
                <div>
                  <p className="font-semibold">Fundraising & Sponsorship:</p>
                  <p className="text-muted-foreground">Amy Wilson, Sponsorship Director</p>
                </div>
              </div>
            </div>

            {/* Practice Resources & Drill Library */}
            <div className="max-w-6xl mx-auto">
              <h3 className="text-2xl font-bold mb-8 text-center">Practice Plans & Drill Library</h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">T-Ball (Ages 4-6)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Focus: Fun, basic skills, attention span</p>
                    <div className="space-y-2 text-sm">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="font-semibold mb-1">Sample Practice (45 min)</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Warm-up games (10 min)</li>
                          <li>• Hitting off tee (15 min)</li>
                          <li>• Throwing basics (10 min)</li>
                          <li>• Base running fun (10 min)</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="font-semibold mb-1">Key Drills</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Alligator catch (fielding)</li>
                          <li>• Freeze tag (agility)</li>
                          <li>• Partner toss (throwing)</li>
                          <li>• Red light/green light (running)</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pinto (Ages 7-8)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Focus: Fundamentals, positions, teamwork</p>
                    <div className="space-y-2 text-sm">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="font-semibold mb-1">Sample Practice (60 min)</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Warm-up & stretch (5 min)</li>
                          <li>• Throwing progression (15 min)</li>
                          <li>• Live batting practice (20 min)</li>
                          <li>• Fielding stations (15 min)</li>
                          <li>• Situational scrimmage (5 min)</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="font-semibold mb-1">Key Drills</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Ground ball progression</li>
                          <li>• Soft toss hitting</li>
                          <li>• Relay throws</li>
                          <li>• Pop fly communication</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Bronco (Ages 9-10)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Focus: Player pitch, strategy, positions</p>
                    <div className="space-y-2 text-sm">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="font-semibold mb-1">Sample Practice (75 min)</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Dynamic warm-up (10 min)</li>
                          <li>• Throwing & arm care (10 min)</li>
                          <li>• Batting practice rotation (25 min)</li>
                          <li>• Infield/outfield work (20 min)</li>
                          <li>• Situational play (10 min)</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="font-semibold mb-1">Key Drills</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Pitching mechanics</li>
                          <li>• Rundowns</li>
                          <li>• Double play turns</li>
                          <li>• Bunt defense</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pony (Ages 11-12)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Focus: Advanced skills, game situations</p>
                    <div className="space-y-2 text-sm">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="font-semibold mb-1">Sample Practice (90 min)</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Arm care routine (15 min)</li>
                          <li>• Live BP stations (30 min)</li>
                          <li>• Position-specific work (25 min)</li>
                          <li>• Team defense (15 min)</li>
                          <li>• Conditioning (5 min)</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="font-semibold mb-1">Key Drills</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Cutoff & relay systems</li>
                          <li>• First & third defense</li>
                          <li>• Two-strike approach hitting</li>
                          <li>• Pick-off moves</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Colt (Ages 13-14)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Focus: High school prep, competition</p>
                    <div className="space-y-2 text-sm">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="font-semibold mb-1">Sample Practice (90 min)</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Band work & stretching (10 min)</li>
                          <li>• Live pitching (35 min)</li>
                          <li>• Advanced defensive work (25 min)</li>
                          <li>• Situational scrimmage (15 min)</li>
                          <li>• Strength & conditioning (5 min)</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="font-semibold mb-1">Key Drills</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Pitch sequencing</li>
                          <li>• Situational hitting (hit & run, etc.)</li>
                          <li>• Pitcher covering first</li>
                          <li>• Sliding techniques</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-primary/10">
                  <CardHeader>
                    <CardTitle className="text-lg">Downloadable Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Additional coaching materials available:</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-primary">📋</span>
                        <span>Practice plan templates</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">📊</span>
                        <span>Pitch count tracking sheets</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">📈</span>
                        <span>Player evaluation forms</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">🎯</span>
                        <span>Drill diagram library</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">📱</span>
                        <span>Team communication tips</span>
                      </li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-4">
                      Email <strong>coaches@cdbaseball.org</strong> to request access to full library
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Coach Resources */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>External Coaching Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Recommended resources for continued coaching development:
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• USA Baseball Coaching Education</li>
                      <li>• PONY Baseball Coaching Guides</li>
                      <li>• Positive Coaching Alliance</li>
                      <li>• YouTube: Baseball coaching channels</li>
                      <li>• Local coaching clinics (posted in Events)</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Safety & First Aid</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      All coaches must complete:
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Background check (provided by CDBL)</li>
                      <li>• CPR certification (recommended)</li>
                      <li>• Concussion awareness training</li>
                      <li>• Heat illness prevention</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-3">
                      First aid kits available at each field
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
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