import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState } from "react";

const InHouseRules = () => {
  const [selectedLeague, setSelectedLeague] = useState("tball");

  const leagues = [
    { value: "tball", label: "T-Ball" },
    { value: "pinto", label: "Pinto" },
    { value: "mustang", label: "Mustang" },
    { value: "bronco", label: "Bronco" },
    { value: "pony", label: "Pony" },
  ];

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
            <h1 className="text-4xl md:text-6xl font-bold mb-6">In-House Rules & Policies</h1>
            <p className="text-xl max-w-2xl">Playing rules and league policies for all In-House divisions.</p>
          </div>
        </section>

        {/* Rules Content */}
        <section className="py-16 bg-background">
          <div className="container max-w-6xl">
            <Tabs value={selectedLeague} onValueChange={setSelectedLeague} className="w-full">
              {/* Mobile/Tablet Dropdown */}
              <div className="lg:hidden mb-8">
                <Select value={selectedLeague} onValueChange={setSelectedLeague}>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Select a league" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {leagues.map((league) => (
                      <SelectItem key={league.value} value={league.value}>
                        {league.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Desktop Buttons */}
              <TabsList className="hidden lg:grid w-full grid-cols-5 mb-8">
                <TabsTrigger value="tball">T-Ball</TabsTrigger>
                <TabsTrigger value="pinto">Pinto</TabsTrigger>
                <TabsTrigger value="mustang">Mustang</TabsTrigger>
                <TabsTrigger value="bronco">Bronco</TabsTrigger>
                <TabsTrigger value="pony">Pony</TabsTrigger>
              </TabsList>

              {/* T-Ball Rules */}
              <TabsContent value="tball">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-3xl">T-Ball Division Rules</CardTitle>
                    <p className="text-muted-foreground">Ages 4-6 • Focus on Fun & Fundamentals</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Game Length</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>No new inning shall start after 1 hour 15 minutes</li>
                        <li>No official score kept - focus is on learning and fun</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Playing Time</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>All players bat every inning (continuous batting order)</li>
                        <li>All players play in the field</li>
                        <li>Fair playing time for every child</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Batting & Base Running</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Coach pitches 4 pitches, then use tee</li>
                        <li>Runners advance one base at a time on hit balls only</li>
                        <li>Last batter of inning rounds all bases</li>
                        <li>No outs recorded in early season (through April)</li>
                        <li>Starting May, runners can be tagged/forced but stay on base</li>
                        <li>In June, outs count and runners leave field when out</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Equipment & Safety</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>T-Ball approved bat (2 1/4" max barrel, USSSA 1.15)</li>
                        <li>Helmets required for batters and base runners</li>
                        <li>Pitcher position player must wear helmet with face guard</li>
                        <li>Complete uniform required to play</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pinto Rules */}
              <TabsContent value="pinto">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-3xl">Pinto Division Rules</CardTitle>
                    <p className="text-muted-foreground">Ages 7-8 • Transitional to Player Pitch</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Game Length</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>No new inning after 1 hour 45 minutes</li>
                        <li>5 runs per inning max (innings 1-5), 10 runs in 6th inning</li>
                        <li>No official score/standings kept</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Pitching</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li><strong>Before Memorial Day:</strong> Coach pitch from 40 feet, 7 pitches per batter</li>
                        <li><strong>After Memorial Day:</strong> Player pitch innings 3-5, coach pitch innings 1,2,6</li>
                        <li>40 pitch maximum per player per game (or 1 inning)</li>
                        <li>Strikeouts only during player-pitch innings</li>
                        <li>No walks or HBP - revert to coach pitch for that batter</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Playing Time</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Each player must play 2 innings infield and 2 innings outfield</li>
                        <li>10 defensive players (maximum 4 outfielders)</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Base Running</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>No stealing or leading off</li>
                        <li>Advance only one base on overthrows to 2nd base</li>
                        <li>Doubles allowed if ball reaches outfield</li>
                        <li>Triples/home runs only on fly balls to outfield</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Mustang Rules */}
              <TabsContent value="mustang">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-3xl">Mustang Division Rules</CardTitle>
                    <p className="text-muted-foreground">Ages 9-10 • Competitive Player Pitch</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Game Length</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>6 innings, no new inning after 2 hours (1:45 if back-to-back games)</li>
                        <li>5 run maximum per inning (no max in last inning)</li>
                        <li>Mercy rules: 15 after 4, 12 after 5 innings</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Pitching Limits</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>75 pitches per game maximum</li>
                        <li>Required rest: 41-75 pitches = 2 days, 21-40 = 1 day</li>
                        <li>Pitch counts strictly enforced for player safety</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Playing Time</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>9 defensive players</li>
                        <li>All players must play 2 innings in infield before end of 5th</li>
                        <li>No player sits more than one inning in a row</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Base Running</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Stealing allowed after ball crosses home plate</li>
                        <li>No stealing home</li>
                        <li>Runners may advance one base on overthrows</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Bronco Rules */}
              <TabsContent value="bronco">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-3xl">Bronco Division Rules</CardTitle>
                    <p className="text-muted-foreground">Ages 11-12 • Competitive Player Pitch</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Game Length</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>6 innings, no new inning after 2 hours (1:45 if back-to-back games)</li>
                        <li>5 run maximum per inning (no max in last inning)</li>
                        <li>Mercy rules: 15 after 4, 12 after 5 innings</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Pitching Limits</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>75 pitches per game maximum</li>
                        <li>Required rest: 41-75 pitches = 2 days, 21-40 = 1 day</li>
                        <li>Pitch counts strictly enforced for player safety</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Playing Time</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>9 defensive players</li>
                        <li>All players must play 2 innings in infield before end of 5th</li>
                        <li>No player sits more than one inning in a row</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Base Running</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Stealing allowed after ball crosses home plate</li>
                        <li>No stealing home</li>
                        <li>Runners may advance one base on overthrows</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pony Rules */}
              <TabsContent value="pony">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-3xl">Pony Division Rules</CardTitle>
                    <p className="text-muted-foreground">Ages 13-14 • Advanced Competition</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Game Length</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>7 innings, no new inning after 2 hours 15 minutes</li>
                        <li>Mercy rules: 15 after 4, 12 after 5 innings</li>
                        <li>No run limit per inning</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Pitching Limits</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>85 pitches per game maximum</li>
                        <li>Required rest: 61-85 = 3 days, 41-60 = 2 days, 21-40 = 1 day</li>
                        <li>Players may not catch same day they pitch 41+ pitches</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Base Running</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Full stealing including home plate</li>
                        <li>Drop third strike rule in effect</li>
                        <li>Standard baseball rules apply</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>

            {/* General Policies */}
            <div className="mt-12 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>General In-House Policies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Family Code of Conduct</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      <li>Treat all players, coaches, and officials with respect</li>
                      <li>Display good sportsmanship at all times</li>
                      <li>Support all players, not just your child</li>
                      <li>No profanity, insults, or abusive language</li>
                      <li>Zero tolerance for violence or threats</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Weather Policy</h4>
                    <p className="text-muted-foreground">
                      Games may be delayed or cancelled due to weather. Check email and the CDBL website for updates. 
                      Coaches will notify families of cancellations when possible.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Uniform Policy</h4>
                    <p className="text-muted-foreground">
                      Complete uniform (jersey, hat, pants) required for all games. Players without proper uniform may not be able to play.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Safety First</h4>
                    <p className="text-muted-foreground">
                      All safety equipment must be worn as required by division rules. Coaches conduct safety briefings before each game. 
                      Players showing signs of injury should be immediately removed from play.
                    </p>
                  </div>
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

export default InHouseRules;