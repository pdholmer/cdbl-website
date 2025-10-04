import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Users, Vote, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const BoardInfo = () => {
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
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Board of Directors</h1>
            <p className="text-xl max-w-2xl">
              CDBL is governed by a volunteer board of directors committed to excellence in youth baseball.
            </p>
          </div>
        </section>

        {/* Current Board Officers */}
        <section className="py-16 bg-background">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">2024-2025 Board of Directors</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
              <Card>
                <CardHeader>
                  <CardTitle>Jason Taylor</CardTitle>
                  <p className="text-sm text-primary font-semibold">President</p>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="h-3 w-3" />
                      <a href="mailto:board@cdbaseball.org" className="hover:underline">board@cdbaseball.org</a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Humberto Camacho</CardTitle>
                  <p className="text-sm text-primary font-semibold">Vice President</p>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="h-3 w-3" />
                      <a href="mailto:board@cdbaseball.org" className="hover:underline">board@cdbaseball.org</a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Todd Weachter</CardTitle>
                  <p className="text-sm text-primary font-semibold">Treasurer</p>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="h-3 w-3" />
                      <a href="mailto:board@cdbaseball.org" className="hover:underline">board@cdbaseball.org</a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Carrie Wolak</CardTitle>
                  <p className="text-sm text-primary font-semibold">Secretary</p>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="h-3 w-3" />
                      <a href="mailto:board@cdbaseball.org" className="hover:underline">board@cdbaseball.org</a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Committees & Roles */}
            <div className="max-w-6xl mx-auto">
              <h3 className="text-2xl font-bold mb-6 text-center">Committees & Roles</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Communications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm"><strong>League Communication:</strong> Danae Wezdecki</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Grounds & Property</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p><strong>Playing Surfaces:</strong> Jim Patano / Larry Rigler</p>
                    <p><strong>Equipment Repair/Upkeep:</strong> Jake Lind / Larry Rigler</p>
                    <p><strong>Garbage & Port-o-Potties:</strong> Chuck Sanders</p>
                    <p><strong>Turface & Chalk:</strong> Brian Gentzle / Billy Hardin</p>
                    <p><strong>Shed Upkeep:</strong> Brian Gentzle</p>
                    <p><strong>Weed & Mosquito Control:</strong> Dillon Wiback</p>
                    <p><strong>Grass Edging & Trimming:</strong> Dillon Wiback / Zimmerman</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Burlington Fields</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm"><strong>Committee Chair:</strong> Toby Simmons</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Plato Park / Stonecrest</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm"><strong>Committee Chair:</strong> John Lawrence / Chuck Barham / Billy Hardin</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Building Projects</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p><strong>Committee Chair:</strong> John Lawrence</p>
                    <p><strong>Committee Members:</strong> Dan Cikauskas / Brian Currey / Jim Patano / Larry Rigler / JP Maurer</p>
                    <p><strong>Plato:</strong> Dan Cikauskas / Larry Rigler</p>
                    <p><strong>Stonecrest:</strong> Brian Currey*</p>
                    <p><strong>Burlington Fields:</strong> Toby Simmons</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">PR / Social Media</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm"><strong>Committee Chair:</strong> Stephan Holm</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Website</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm"><strong>Committee Chair:</strong> Humberto Camacho / Jen Rigler / JP Maurer</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Registration & Background Checks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm"><strong>Committee Chair:</strong> Beto Camacho / Jen Rigler</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Scheduling</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm"><strong>Committee Chair:</strong> Humberto Camacho / Jen Rigler / Joe Dobek</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Travel Coordinator</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p><strong>Travel (General)/Tryouts/Draft:</strong> Bobby Rogers / Carrie Wolak / Alex Turk</p>
                    <p><strong>Trainers/Player Development Training Facility:</strong> Billy Hardin / Brandon Murphy</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">IHTT</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm"><strong>Committee Chair:</strong> Jason Taylor</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ratings / Draft Day</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm"><strong>Committee Chair:</strong> Pat McGrath / Ryan Keeton</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Baseball Equipment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm"><strong>Committee Chair:</strong> Kevin Barrow</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Uniforms</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p><strong>In-House:</strong> Eric Bohn / Jen Rigler</p>
                    <p><strong>Travel:</strong> Justin Stull</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">CDBL Tournaments</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p><strong>Committee Chair:</strong> Alex Traficanti / Jason Carte*</p>
                    <p><strong>Committee Members:</strong> Josh Rowoldt</p>
                    <p><strong>Field Maintenance:</strong> Vinnie D'Antonio</p>
                    <p><strong>Memorial Day (B-Travel/IHTT):</strong> Brian Gentzle / John Lawrence / Josh Rowoldt / Alex Traficanti</p>
                    <p><strong>Fathers Day (Travel):</strong> Brian Gentzle / Billy Hardin</p>
                    <p><strong>Mid-Summer Classic (IHTT):</strong> Josh Rowoldt / Jason Taylor</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Safety: First Aid & AED</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm"><strong>Committee Chair:</strong> Danae Wezdecki</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sponsorship/Fundraising</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p><strong>Committee Chair:</strong> Chuck Barham / Stephan Holm</p>
                    <p><strong>Golf Fundraiser:</strong> Joe Daniels / Ryan Keeton / Alex Turk / Chris Sobey</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Concessions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p><strong>Committee Chair:</strong> Chris Manczko</p>
                    <p><strong>Product Inventory & Equipment:</strong> Joe Daniels / Jamison Rayner / Chris Sauceda</p>
                    <p><strong>Staff Scheduling:</strong> Danae Wezdecki</p>
                    <p><strong>General Support / Deliveries:</strong> Joe Daniels / Jason Flanagan / Jamison Rayner / Chris Sauceda</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Spirit Wear</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm"><strong>Committee Chair:</strong> Jordan Mansk</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Player & Coach Development</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm"><strong>Committee Chair:</strong> Brandon Murphy / Toby Simmons / Chuck Barham</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Division Coordinators</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p><strong>T-Ball:</strong> Eric Bohn</p>
                    <p><strong>Pinto:</strong> Ryan Keeton</p>
                    <p><strong>Mustang:</strong> Josh Rowoldt</p>
                    <p><strong>Bronco:</strong> Todd Weachter</p>
                    <p><strong>Pony / Colt:</strong> Vinny D'Antonio / Chris Sauceda</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Umpires</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm"><strong>Committee Chair:</strong> Brian Gentzle / Jen Rigler</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Rules</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p><strong>Committee Chair:</strong> Humberto Camacho / Billy Hardin / Chuck Sanders</p>
                    <p><strong>Committee Members:</strong> Dan Cikauskas / Alex Turk</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Awards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm"><strong>Committee Chair:</strong> Alex Traficanti / Eric Bohn / Jordan Mansk</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Scholarship</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p><strong>Committee Chair:</strong> Chad Rakow</p>
                    <p><strong>Committee Members:</strong> Ryan Keeton / Vinny D'Antonio</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Player Advocacy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p><strong>Opening Day Ceremonies:</strong> CDBL Board</p>
                    <p><strong>Picture Day:</strong> Joe Dobek (In-House) / Carrie Wolak (Travel)</p>
                    <p><strong>Player Appreciation Day (PAD):</strong> Billy Hardin / Brandon Murphy / Chad Rakow / Coordinators</p>
                    <p><strong>CDBL Minor League Game:</strong> Stephan Holm</p>
                    <p><strong>Banana Ball:</strong> Brandon Murphy / Toby Simmons / Justin Stull</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Disciplinary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p><strong>Committee Chair:</strong> Appointed if/when necessary</p>
                    <p><strong>Committee Members:</strong> Appointed if/when necessary</p>
                  </CardContent>
                </Card>
              </div>

              <p className="text-sm text-muted-foreground mt-6 text-center">* = Honorary Board Member Volunteer</p>
            </div>
          </div>
        </section>

        {/* Board Meetings */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Board Meetings & Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <Calendar className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Upcoming Meetings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Board meetings are held monthly and are open to all CDBL members. Meetings typically occur on the third Tuesday of each month at 7:00 PM.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    For information about upcoming board meetings, please contact the board at board@cdbaseball.org or check our Sports Connect portal.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <FileText className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Meeting Minutes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Meeting minutes and agendas are available to all members. Recent meeting summaries:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Contact board@cdbaseball.org to request meeting minutes or archived documents.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Elections & Volunteering */}
        <section className="py-16 bg-background">
          <div className="container max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Get Involved</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card>
                <CardHeader>
                  <Vote className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Board Elections</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Board elections are held annually. Positions are open to any CDBL member in good standing. For information about upcoming elections and nomination procedures, please contact the board at board@cdbaseball.org.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Committee Volunteers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Board members lead committees, but volunteers are always needed:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Fields & Facilities Committee</li>
                    <li>• Fundraising Committee</li>
                    <li>• Events & Spirit Wear Committee</li>
                    <li>• Safety & Equipment Committee</li>
                    <li>• Umpire Development</li>
                  </ul>
                  <Button asChild className="mt-4" size="sm">
                    <Link to="/volunteer">Volunteer Opportunities</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-3">Questions for the Board?</h3>
                <p className="text-muted-foreground mb-4">
                  The board welcomes questions, feedback, and suggestions from all CDBL families. You can contact board members directly via email or attend any monthly meeting.
                </p>
                <Button asChild>
                  <Link to="/contact">Contact the Board</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BoardInfo;
