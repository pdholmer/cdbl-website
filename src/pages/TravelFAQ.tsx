import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TravelFAQ = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section 
          className="relative py-16 md:py-24 text-primary-foreground overflow-hidden"
          style={{ 
            background: 'linear-gradient(135deg, hsl(215 100% 26%) 0%, hsl(201 63% 56%) 100%)'
          }}
        >
          <div className="container">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Travel Baseball FAQ</h1>
            <p className="text-xl max-w-2xl">Everything you need to know about the CDBL Rockets travel program.</p>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-16 bg-background">
          <div className="container max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>What is the difference between In-House and Travel baseball?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    In-House is recreational baseball focused on learning fundamentals and having fun. Everyone makes a team, plays locally, and the season is shorter (April-June).
                  </p>
                  <p className="text-muted-foreground">
                    Travel baseball is competitive with tryouts required. Teams compete in regional tournaments most weekends (March-August), require significant time and financial commitment, and focus on advanced skill development and high-level competition.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How do tryouts work?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    Tryouts are held over one weekend in March. Players are evaluated on hitting, fielding, throwing, speed, and baseball IQ. 
                    Coaches score each player in these categories.
                  </p>
                  <p className="text-muted-foreground">
                    After Saturday tryouts, some players may be invited to callback sessions on Sunday for further evaluation. 
                    Teams are announced Monday evening. Not making a team doesn't mean a player isn't talented - it often means they need more experience or aren't quite ready for the travel commitment.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>What if my child doesn't make a travel team?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Players who don't make travel teams are encouraged to play in our In-House program to continue developing their skills. 
                    Many successful travel players spent seasons in In-House before making travel teams. Tryouts are held every year, 
                    giving players another opportunity to showcase their improved skills.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Can my child do both In-House and Travel?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    No. The overlapping schedules and time commitments make it impossible to participate in both programs simultaneously. 
                    Players must choose one program. However, players can switch between programs in different years.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How much does travel baseball really cost?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    <strong>Direct Costs:</strong>
                  </p>
                  <ul className="text-muted-foreground space-y-1 ml-4 mb-3">
                    <li>• Registration fee: ~$600</li>
                    <li>• Tournament entry fees: $1,500-$2,500 (paid to team)</li>
                    <li>• Uniforms and team gear: $200-$400</li>
                  </ul>
                  <p className="text-muted-foreground mb-3">
                    <strong>Additional Costs:</strong>
                  </p>
                  <ul className="text-muted-foreground space-y-1 ml-4">
                    <li>• Hotels: $100-$150 per night x 10-15 weekends = $1,500-$3,000</li>
                    <li>• Gas/travel: ~$50-$100 per weekend = $500-$1,500</li>
                    <li>• Meals: $50-$100 per weekend = $500-$1,500</li>
                    <li>• Personal equipment (bats, gloves, etc.): $200-$500</li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    <strong>Total typical investment: $3,500-$5,000 per season</strong>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How many games and tournaments should we expect?</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-muted-foreground space-y-2">
                    <li>• 8U/10U: 8-12 tournaments, 50-60 total games</li>
                    <li>• 12U/14U: 12-15 tournaments, 60-70 total games</li>
                    <li>• Weeknight games: 1-2 per week during season</li>
                    <li>• Practice: 2-3 times per week year-round</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>What is expected of parents?</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-muted-foreground space-y-2">
                    <li>• Attend all tournaments and games (family commitment)</li>
                    <li>• Transport player to practices and local games</li>
                    <li>• Pay team dues on time</li>
                    <li>• Volunteer for team responsibilities (scorekeeping, field setup, etc.)</li>
                    <li>• Support coaching decisions and maintain positive sideline behavior</li>
                    <li>• Participate in fundraising activities</li>
                    <li>• Communicate availability and conflicts promptly</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Can players miss tournaments or games?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Commitment to the team is essential in travel baseball. While emergencies and unavoidable conflicts happen, 
                    frequent absences impact team chemistry and performance. Players should be able to attend 90%+ of tournaments and practices. 
                    Families should carefully review the schedule before committing. Coaches understand occasional conflicts but expect advance notice.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How are teams selected and how many players per team?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    Teams typically have 11-13 players. Coaches select teams based on tryout evaluations, balancing positions, 
                    pitching depth, and overall team chemistry. The goal is to create competitive, balanced rosters.
                  </p>
                  <p className="text-muted-foreground">
                    CDBL typically fields one team per age group (8U, 10U, 12U, 14U), though this can vary based on tryout numbers and talent depth.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Do travel players get instruction or just play games?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Travel teams emphasize player development through practices (2-3x per week), position-specific training, 
                    and game experience. Coaches provide instruction on advanced techniques, game strategy, and mental preparation. 
                    However, many families also invest in private lessons for hitting, pitching, or fielding to accelerate development.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Will my child get playing time?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Travel baseball is competitive, and playing time is earned through performance, practice effort, and attitude. 
                    Coaches strive to develop all players, but the best players will get more playing time in key situations. 
                    Unlike In-House, equal playing time is not guaranteed. This is part of learning to compete at higher levels.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Is travel baseball the right fit for my child?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    Travel baseball is best for players who:
                  </p>
                  <ul className="text-muted-foreground space-y-1 ml-4">
                    <li>• Have played multiple seasons and show strong fundamentals</li>
                    <li>• Genuinely love the game and want to play at higher levels</li>
                    <li>• Can handle constructive criticism and competitive pressure</li>
                    <li>• Are willing to practice and work on skills outside of team activities</li>
                    <li>• Can balance baseball with school and other responsibilities</li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    If your child enjoys baseball but isn't passionate about year-round commitment, In-House may be a better fit. 
                    There's no shame in choosing recreational baseball - it's about finding the right level for each child!
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 text-center space-y-4">
              <p className="text-muted-foreground">
                Still have questions? Contact our Travel Coordinator
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" asChild>
                  <a href="mailto:travel@cdbl.org">Email: travel@cdbl.org</a>
                </Button>
                <Button asChild>
                  <Link to="/travel/registration">Register for Tryouts</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TravelFAQ;