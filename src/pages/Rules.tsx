import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Rules = () => {
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
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Rules & Policies</h1>
            <p className="text-xl max-w-2xl">Complete playing rules and league policies for all CDBL divisions.</p>
          </div>
        </section>

        {/* Rules Content */}
        <section className="py-16 bg-background">
          <div className="container max-w-6xl">
            <Tabs defaultValue="constitution" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 mb-8">
                <TabsTrigger value="constitution">Constitution</TabsTrigger>
                <TabsTrigger value="tball">T-Ball</TabsTrigger>
                <TabsTrigger value="pinto">Pinto</TabsTrigger>
                <TabsTrigger value="mustang">Mustang</TabsTrigger>
                <TabsTrigger value="other">Other Rules</TabsTrigger>
                <TabsTrigger value="tournament">Tournament</TabsTrigger>
              </TabsList>

              {/* Constitution */}
              <TabsContent value="constitution">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-3xl">CDBL Constitution</CardTitle>
                    <p className="text-muted-foreground">Central District Baseball League</p>
                    <p className="text-sm text-muted-foreground">Revised May 2024 by CDBL Board</p>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible>
                      <AccordionItem value="article1">
                        <AccordionTrigger>Article I - Name</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          <p>
                            This organization shall be known as Central District Baseball League, hereinafter referred to as "CDBL" and/or "League." 
                            Children who reside within the communities of Central School District 301 boundaries and subscribe to the rules of this league 
                            are eligible. Once a player has resided and played in the league, they shall be eligible to play in the league even after 
                            moving out of the district.
                          </p>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="article2">
                        <AccordionTrigger>Article II - Objectives</AccordionTrigger>
                        <AccordionContent className="space-y-3 text-muted-foreground">
                          <p>
                            <strong>Section 1 - Objectives:</strong>
                          </p>
                          <p>
                            A. The objective of the Central District Baseball League shall be to implant firmly in the participants of the community 
                            the ideas of good sportsmanship, honesty, loyalty, courage, and respect for authority. The league shall not tolerate any 
                            less from its participants, coaches, or parents.
                          </p>
                          <p>
                            B. All Directors, Officers, and Members shall bear in mind that the winning of games is secondary. Building every player's 
                            skill and providing a positive, enjoyable, and safe environment to play baseball is a priority.
                          </p>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="article3">
                        <AccordionTrigger>Article III - Membership</AccordionTrigger>
                        <AccordionContent className="space-y-3 text-muted-foreground">
                          <p><strong>Section 1 - Eligibility:</strong> Any person sincerely interested in active participation to affect the objective of this league may apply to become a Member.</p>
                          
                          <p><strong>Section 2 - Classes of Members:</strong></p>
                          <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Regular Members:</strong> Must be voted in with 51% vote at annual September meeting. Must attend 50% of scheduled meetings to maintain voting rights.</li>
                            <li><strong>Honorary Members:</strong> Elected by unanimous vote of Directors. No management rights or obligations.</li>
                            <li><strong>Sustaining Members:</strong> Financial contributors who may be approved by 51% Board vote. No management rights.</li>
                          </ul>

                          <p><strong>Section 3 - Disciplinary Action:</strong></p>
                          <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Board may discipline, suspend, or terminate membership by two-thirds vote</li>
                            <li>Person notified in writing 3 days prior to hearing</li>
                            <li>Penalties may include: Warning, Suspension, Dismissal, or Termination</li>
                            <li>Complaints must be submitted in writing within 72 hours of occurrence</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="article4">
                        <AccordionTrigger>Article IV - League Fees</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          <p>
                            A reasonable League fee may be assessed as a parents' obligation to assure the operational continuity of the League. 
                            At no time should payment of any fee be a prerequisite for participation in the Central District Baseball League baseball program.
                          </p>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="article5">
                        <AccordionTrigger>Article V - Meetings</AccordionTrigger>
                        <AccordionContent className="space-y-3 text-muted-foreground">
                          <ul className="list-disc list-inside space-y-2">
                            <li><strong>Annual Meeting:</strong> Held in September for electing Officers and Directors</li>
                            <li><strong>Notice:</strong> At least 10 days advance notice via email</li>
                            <li><strong>Special Meetings:</strong> May be called by Board, Secretary, or President. Requires 51% Board Member written request</li>
                            <li><strong>Quorum:</strong> 51% of Members necessary for regularly scheduled meeting</li>
                            <li><strong>Voting:</strong> Only Regular Members in good standing with required attendance may vote</li>
                            <li><strong>Elections:</strong> By secret ballot, show of hands, or voice vote</li>
                            <li><strong>Proxies:</strong> Must be in written form and on file with Board prior to use</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="article6">
                        <AccordionTrigger>Article VI - Executive Board of Directors</AccordionTrigger>
                        <AccordionContent className="space-y-3 text-muted-foreground">
                          <ul className="list-disc list-inside space-y-2">
                            <li>Management vested in executive board of directors</li>
                            <li>Minimum 5 Board Members, no maximum</li>
                            <li>Directors serve from September annual meeting to following year's annual meeting</li>
                            <li>Board includes Officers and duly elected League Members</li>
                            <li>Annual election in September by 51% majority vote</li>
                            <li>Officers elected first, then remaining board members</li>
                            <li>Directors may be removed by two-thirds vote of Board Members in attendance</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="article7">
                        <AccordionTrigger>Article VII - Committees</AccordionTrigger>
                        <AccordionContent className="space-y-3 text-muted-foreground">
                          <p>The Board may establish committees including but not limited to:</p>
                          <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Grounds & Property Committee</li>
                            <li>Registration Committee</li>
                            <li>Scheduling Committee</li>
                            <li>Travel Team Committee</li>
                            <li>Equipment Committee</li>
                            <li>Uniforms Committee</li>
                            <li>Tournament Committee</li>
                            <li>Safety Committee</li>
                            <li>Sponsorship/Fundraising Committee</li>
                            <li>Concessions Committee</li>
                            <li>Player & Coach Development Committee</li>
                            <li>Division Coordinators</li>
                            <li>Umpire Committee</li>
                            <li>Rules Committee</li>
                            <li>Disciplinary Committee</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="article8">
                        <AccordionTrigger>Article VIII - Officers, Duties & Powers</AccordionTrigger>
                        <AccordionContent className="space-y-3 text-muted-foreground">
                          <p><strong>Required Officers:</strong></p>
                          <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>President:</strong> Presides at all meetings, exercises general supervision over league affairs</li>
                            <li><strong>Vice President:</strong> Performs duties of President in their absence, supervises coaches and managers</li>
                            <li><strong>Secretary:</strong> Keeps minutes of all meetings, maintains records and correspondence</li>
                            <li><strong>Treasurer:</strong> Receives and disburses funds, maintains financial records, prepares budget</li>
                          </ul>
                          <p>Officers elected by majority vote at annual September meeting. Term is one year.</p>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="article9">
                        <AccordionTrigger>Article IX - Managers, Coaches, Umpires & Players</AccordionTrigger>
                        <AccordionContent className="space-y-3 text-muted-foreground">
                          <p><strong>Manager/Coach Selection:</strong></p>
                          <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Applications reviewed and approved by Board</li>
                            <li>Must complete background check</li>
                            <li>Must sign Code of Conduct</li>
                            <li>Responsible for team conduct and adherence to league rules</li>
                          </ul>

                          <p><strong>Player Eligibility:</strong></p>
                          <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Age determined as of April 30th of current year</li>
                            <li>Must register and pay fees</li>
                            <li>Must provide proof of age</li>
                            <li>Subject to league rules and Code of Conduct</li>
                          </ul>

                          <p><strong>Call-Up Rules:</strong></p>
                          <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Manager must contact division coordinator below</li>
                            <li>Call-up pool is blind - no specific player requests</li>
                            <li>Pool player must play minimum 2 innings and stay in batting order</li>
                            <li>Cannot decline player once they arrive</li>
                            <li>Violations result in loss of privileges and disciplinary review</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="article10">
                        <AccordionTrigger>Article X - Affiliation</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          <p>
                            The League may affiliate with regional, state, or national youth baseball organizations as determined by the Board of Directors.
                          </p>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="article11">
                        <AccordionTrigger>Article XI - Financial and Accounting</AccordionTrigger>
                        <AccordionContent className="space-y-3 text-muted-foreground">
                          <ul className="list-disc list-inside space-y-2">
                            <li>Treasurer maintains all financial records</li>
                            <li>Annual budget prepared and approved by Board</li>
                            <li>All expenditures require proper authorization</li>
                            <li>Financial reports presented at regular meetings</li>
                            <li>Annual financial review/audit conducted</li>
                            <li>All funds belong to the League</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="article13">
                        <AccordionTrigger>Article XIII - Travel and Tournament Teams</AccordionTrigger>
                        <AccordionContent className="space-y-3 text-muted-foreground">
                          <ul className="list-disc list-inside space-y-2">
                            <li>Travel teams represent CDBL in competitive tournaments</li>
                            <li>Try-outs conducted for team selection</li>
                            <li>Additional fees may apply for travel programs</li>
                            <li>Travel teams subject to all CDBL rules and policies</li>
                            <li>Tournament teams organized for specific events</li>
                            <li>Travel coordinator oversees all travel programs</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="article14">
                        <AccordionTrigger>Article XIV - Rules & Regulations</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          <p>
                            The Board of Directors shall have the power to make, adopt, amend, and enforce such Rules and Regulations, 
                            not inconsistent with this Constitution, as it shall deem necessary for the management and operation of the League. 
                            All Rules and Regulations shall be in writing and made available to all members.
                          </p>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="article15">
                        <AccordionTrigger>Article XV - Amendments</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          <p>
                            This Constitution may be amended at any regular or special meeting of the Members by a two-thirds vote of those present, 
                            providing that written notice of the proposed amendment is given to each member at least ten (10) days prior to the meeting.
                          </p>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="conduct">
                        <AccordionTrigger>Code of Conduct</AccordionTrigger>
                        <AccordionContent className="space-y-4 text-muted-foreground">
                          <div>
                            <p className="font-semibold mb-2">Family Code of Conduct:</p>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                              <li>Treat all players, coaches, officials, and spectators with respect</li>
                              <li>Display good sportsmanship at all times</li>
                              <li>Support all players, not just your child</li>
                              <li>Respect officials' decisions</li>
                              <li>No use of profane, insulting, or abusive language</li>
                              <li>No violence or threat of violence</li>
                              <li>Promote positive experience for all participants</li>
                            </ul>
                          </div>

                          <div>
                            <p className="font-semibold mb-2">Coach Code of Conduct:</p>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                              <li>Be a positive role model for players</li>
                              <li>Promote fair play and sportsmanship</li>
                              <li>Ensure player safety at all times</li>
                              <li>Treat all players fairly and equitably</li>
                              <li>Communicate appropriately with players, parents, and officials</li>
                              <li>Follow all league rules and policies</li>
                              <li>Complete required training and background checks</li>
                              <li>Focus on player development over winning</li>
                            </ul>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* T-Ball Rules */}
              <TabsContent value="tball">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-3xl">T-Ball Division Rules</CardTitle>
                    <p className="text-muted-foreground">5 & 6 Year Olds</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Game Length</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>No new inning shall start after 1 hour 15 minutes from the start of the game</li>
                        <li>No official score will be kept</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Field Setup</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>The defensive team will consist of all players in the field</li>
                        <li>The infield shall have one player per position with the balance of players in the outfield</li>
                        <li>No player at the catcher position – a coach or other adult should be catcher</li>
                        <li>All hits to the outfield will be thrown to second base</li>
                        <li>Field is 50-foot square</li>
                        <li>Home team uses the 3rd base dugout</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Pitching</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Coach pitching: 4 pitches per batter</li>
                        <li>The fifth ball is to be placed on the tee</li>
                        <li>No limits on balls missed on the tee</li>
                        <li>Player in the pitcher position must wear a helmet with face guard</li>
                        <li>If a hit ball rolls less than 5 feet, the ball shall be considered foul</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Batting & Base Running</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Continuous batting order - every player bats in each inning</li>
                        <li>Runners must stay in contact with their base until the ball is hit by the batter</li>
                        <li>Runners permitted to advance only on a hit ball and only one base at a time</li>
                        <li>The last batter up in an inning rounds all the bases</li>
                        <li>No advancing on overthrows</li>
                        <li>Bunting is not permitted</li>
                        <li>Starting in May, runners can stay on base even if forced or tagged out</li>
                        <li>In June, runners must leave the field of play if tagged or forced out</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Equipment</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>USSSA 1.15 stamped bats must be used (2 1/4" Maximum Barrel Size)</li>
                        <li>No composite bats</li>
                        <li>Should use a T-Ball-rated bat</li>
                        <li>Base runners and batters must wear helmets</li>
                        <li>Complete uniform required to play</li>
                        <li>No jewelry except Phiten nylon necklaces with easy-release closure</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Safety</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>During warmups, players should be spaced away from each other</li>
                        <li>Only the batter and the player on deck should have a bat</li>
                        <li>All other players should remain on the bench</li>
                        <li>All equipment kept off the playing field when not in use</li>
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
                    <p className="text-muted-foreground">7 & 8 Year Olds (1st & 2nd Graders)</p>
                    <p className="text-sm text-muted-foreground italic mt-2">
                      The Pinto Level is noncompetitive and transitional, building on t-ball skills and preparing for the Mustang level. 
                      Formal scorekeeping of league games and league standings will not be kept.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Game Length</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>No new inning shall start after 1 hour 45 minutes from the start of the game</li>
                        <li>Inning complete when: all batters have batted, three outs made, or max runs scored</li>
                        <li>5 runs per inning for innings 1-5, 10 runs in the 6th inning</li>
                        <li>No official score kept - runs counted only to determine end of inning</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Field Setup</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Defensive team consists of ten (10) players on the field</li>
                        <li>Pitching rubber = 40 feet, Bases are 55/60 feet apart</li>
                        <li>Each player must play minimum 2 innings infield and 2 innings outfield</li>
                        <li>Maximum four outfielders allowed (must play at same depth)</li>
                        <li>Home team uses 3rd base dugout</li>
                        <li>Pitcher must wear protective mask and stand within 10-foot diameter circle</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Pitching (Before Memorial Day)</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Managers or adult coaches pitch overhand from the rubber (40 feet)</li>
                        <li>Each player gets 7 pitches regardless of strikes</li>
                        <li>If batter doesn't put ball in play after 7 pitches, batter is out</li>
                        <li>Foul ball on 7th pitch is not an out - continue until swing and miss or fair ball</li>
                        <li>Pitches thrown in line drive fashion (no lobs)</li>
                        <li>Batter does NOT take first base if hit by pitch</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">After Memorial Day Rules</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Player-pitch innings: 3rd, 4th, and 5th innings</li>
                        <li>Coach-pitch innings: 1st, 2nd, and 6th innings</li>
                        <li>Strikeouts allowed during player-pitch innings only</li>
                        <li>Walks and HBP NOT allowed - reverts to coach pitch for that batter</li>
                        <li>Players limited to lesser of 1 inning or 40 maximum pitches per game</li>
                        <li>Balls and strikes called during player-pitch innings</li>
                        <li>Each team supplies one umpire (coaches) - switch positions each inning</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Base Running</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Runners must stay in contact with base until ball is hit</li>
                        <li>No base stealing allowed</li>
                        <li>No advancing on overthrows to first, third, or home</li>
                        <li>On overthrows at second base, runner may advance one base at own risk</li>
                        <li>Batter can attempt double if ball makes it to outfield</li>
                        <li>Batter can attempt triple/home run if ball reaches outfield on fly ball only</li>
                        <li>Base runners stopped by infielder possession of ball in infield</li>
                        <li>If runner not halfway to next base at time of possession, must return to previous base</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Equipment & Safety</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>USSSA 1.15 or USA stamped bats with 2 1/4" barrel (no big barrel bats)</li>
                        <li>Wood bats allowed (2 1/4" max barrel size)</li>
                        <li>Bunting not permitted</li>
                        <li>Helmets required for base runners and batters</li>
                        <li>Catchers must wear complete catcher's equipment</li>
                        <li>Courtesy runner allowed for catcher playing position in following inning</li>
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
                    <p className="text-muted-foreground">9 & 10 Year Olds</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Game Length</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>No new inning after 2 hours (1:45 if night game scheduled after)</li>
                        <li>Time limit waived for Championship and 3rd place games</li>
                        <li>Regulation games: 6 innings (complete after 4 innings, 3½ if home ahead)</li>
                        <li>Complete ½ inning: three (3) outs or five (5) runs scored</li>
                        <li>Max 5 runs per inning, except last inning (no maximum)</li>
                        <li>All runs count on home runs that clear the fence</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Mercy Rules</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>15 runs after 4 complete innings (3½ if home team ahead)</li>
                        <li>12 runs after 5 complete innings (4½ if home team ahead)</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Field & Players</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Pitching rubber = 46 feet, Bases are 65 feet apart</li>
                        <li>Defensive team: nine (9) players (minimum eight required)</li>
                        <li>All players must play 2 innings in infield before end of 5th inning</li>
                        <li>No player sits out more than one inning in a row</li>
                        <li>Home team uses 3rd base dugout</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Pitching</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Maximum 6 innings per week, 3 innings per game</li>
                        <li>Pitcher removed after 2 hit batters in inning or 3 in game</li>
                        <li>One pitch in an inning = one inning pitched (one inning = no rest required)</li>
                        <li>Two innings pitched = no pitching following day</li>
                        <li>Three innings pitched = no pitching for 3 following days</li>
                        <li>Pitcher once removed may not return as pitcher in same game</li>
                        <li>2 visits per inning (pitcher must be removed on 2nd visit)</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Batting & Base Running</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Continuous batting order (all players)</li>
                        <li>Bunting permitted (no fake bunt then swing - deemed out)</li>
                        <li>Dropped third strike does NOT apply</li>
                        <li>Infield fly rule will be called</li>
                        <li>Base stealing allowed on any pitch</li>
                        <li>NO STEALING OF HOME PLATE at any time (including on overthrows)</li>
                        <li>Runner at 3rd can only score on batted ball or bases-loaded walk</li>
                        <li>Base runner may not run until pitched ball crosses plate</li>
                        <li>Play dead when ball is on the mound (5-foot radius of rubber)</li>
                        <li>No head-first slides at advancing base (head-first dives back allowed)</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Equipment</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>USSSA 1.15 or USA stamped bats, Max 2-3/4" barrel</li>
                        <li>First bat offense: player out + both teams warned</li>
                        <li>Second offense by either team: player ejected</li>
                        <li>Courtesy runners: must use with 2 outs for catcher in following inning, may use for pitcher</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>




              {/* Other Rules */}
              <TabsContent value="other">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">HR Derby Rules</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">All Levels:</h4>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          <li>Location: Played at the Plato Fields</li>
                          <li>Swings: Each player gets 7 swings (swing and miss, ball in play, or foul = counts)</li>
                          <li>Top 5 finalists move on to HR Derby Finals</li>
                          <li>CDBL IN-HOUSE bat rules for each level apply</li>
                          <li>All players eligible at their registered level or per travel age group</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Scoring by Division:</h4>
                        <Accordion type="single" collapsible>
                          <AccordionItem value="tball-derby">
                            <AccordionTrigger>T-Ball</AccordionTrigger>
                            <AccordionContent>
                              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                <li>5 points = Home Run over fence</li>
                                <li>4 points = Fence to outfield line</li>
                                <li>3 points = Outfield line to infield grass edge</li>
                                <li>1 point = Grass edge to 20' line in infield dirt</li>
                                <li>0 points = Misses, fouls, or shorter than 20' line</li>
                              </ul>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="pinto-derby">
                            <AccordionTrigger>Pinto</AccordionTrigger>
                            <AccordionContent>
                              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                <li>5 points = Home Run over fence</li>
                                <li>3 points = Fence to outfield line</li>
                                <li>1 point = Outfield line to infield grass edge</li>
                                <li>0 points = Misses, fouls, or infield dirt</li>
                              </ul>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="mustang-derby">
                            <AccordionTrigger>Mustang</AccordionTrigger>
                            <AccordionContent>
                              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                <li>5 points = Home Run over fence</li>
                                <li>3 points = Fence to outfield line</li>
                                <li>1 point = Outfield line to infield grass edge</li>
                                <li>0 points = Misses, fouls, or infield dirt</li>
                              </ul>
                            </AccordionContent>
                          </AccordionItem>




                          <AccordionItem value="pony-derby">
                            <AccordionTrigger>Pony</AccordionTrigger>
                            <AccordionContent>
                              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                <li>5 points = Home Run over fence</li>
                                <li>2 points = Fence to outfield line</li>
                                <li>0 points = Misses, fouls, or shorter than outfield line</li>
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">League Policies</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible>
                        <AccordionItem value="weather">
                          <AccordionTrigger>Weather & Lightning Policy</AccordionTrigger>
                          <AccordionContent className="space-y-3">
                            <p className="text-muted-foreground">
                              If anyone sees lightning, move all players and spectators to their cars. 
                              Please do not take shelter in the pavilion or the dugouts.
                            </p>
                            <p className="text-muted-foreground">
                              After a lightning strike, do not resume play until a 30-minute period has elapsed 
                              without another strike or until you have been given the all-clear by a CDBL board member.
                            </p>
                            <button
                              onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2224586', '_blank')}
                              className="text-primary hover:text-primary/80 font-semibold underline"
                            >
                              Check Field Status on Sports Connect →
                            </button>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="callup">
                          <AccordionTrigger>CDBL Call-Up Rules</AccordionTrigger>
                          <AccordionContent>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                              <li>Manager must contact coordinator for division below with game information</li>
                              <li>Player call-up pool is a blind pool</li>
                              <li>Managers may not request specific players</li>
                              <li>Managers may not decline a player once they arrive at field</li>
                              <li>Pool player must play at least 2 innings in field and remain in batting order</li>
                              <li>Violations result in loss of pool player privileges and disciplinary review</li>
                              <li>Full rules located in Article IX of CDBL Constitution</li>
                            </ul>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="uniforms">
                          <AccordionTrigger>Uniform Requirements</AccordionTrigger>
                          <AccordionContent>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                              <li>Complete uniform required to play</li>
                              <li>Jerseys must be tucked in</li>
                              <li>No clothing worn over uniform</li>
                              <li>No jewelry except Phiten nylon necklaces with easy-release closure</li>
                              <li>Call-up players wear their regular team uniform</li>
                            </ul>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="safety">
                          <AccordionTrigger>Safety Requirements</AccordionTrigger>
                          <AccordionContent>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                              <li>Helmets required for base runners and batters (at bat or on deck)</li>
                              <li>Catchers must wear complete catcher's equipment including glove</li>
                              <li>Athletic supporter with cup strongly recommended for all players</li>
                              <li>During warmups, players spaced away from spectator areas</li>
                              <li>Only batter and on-deck player should have bats</li>
                              <li>All equipment kept off field when not in use</li>
                              <li>Spectators may only handle league equipment with manager permission</li>
                            </ul>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="conduct">
                          <AccordionTrigger>Code of Conduct</AccordionTrigger>
                          <AccordionContent>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                              <li>Respect umpires, coaches, and all players</li>
                              <li>No profanity or abusive language</li>
                              <li>Support all players, not just your child</li>
                              <li>Follow ejection and suspension procedures</li>
                              <li>Managers and coaches will NOT argue calls made by umpires</li>
                              <li>All on-field umpire decisions are final</li>
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Rules;
