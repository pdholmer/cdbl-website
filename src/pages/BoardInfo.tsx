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
        <section className="bg-gradient-to-br from-primary to-primary-light py-20 text-primary-foreground">
          <div className="container">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Board of Directors</h1>
            <p className="text-xl max-w-2xl">
              CDBL is governed by a volunteer board of directors committed to excellence in youth baseball.
            </p>
          </div>
        </section>

        {/* Current Board Members */}
        <section className="py-16 bg-background">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Current Board Members</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>John Smith</CardTitle>
                  <p className="text-sm text-primary font-semibold">President</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-3">
                    CDBL parent for 8 years. Background in youth sports administration.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="h-3 w-3" />
                      <span>president@cdbl.org</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Lisa Davis</CardTitle>
                  <p className="text-sm text-primary font-semibold">Vice President</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-3">
                    Former college softball player. Passionate about youth athletics and education.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="h-3 w-3" />
                      <span>vicepresident@cdbl.org</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sarah Johnson</CardTitle>
                  <p className="text-sm text-primary font-semibold">Treasurer</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-3">
                    CPA with 15 years experience. Joined CDBL board in 2025.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="h-3 w-3" />
                      <span>treasurer@cdbl.org</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      <span>(555) 123-4567</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mike Chen</CardTitle>
                  <p className="text-sm text-primary font-semibold">Player Agent</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-3">
                    High school baseball coach. CDBL coach for 10+ years.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="h-3 w-3" />
                      <span>playeragent@cdbl.org</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dave Martinez</CardTitle>
                  <p className="text-sm text-primary font-semibold">Travel Coordinator</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-3">
                    Former minor league player. Leads our competitive travel program.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="h-3 w-3" />
                      <span>travel@cdbl.org</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Amy Wilson</CardTitle>
                  <p className="text-sm text-primary font-semibold">Sponsorship Director</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-3">
                    Marketing professional. Builds relationships with local businesses.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="h-3 w-3" />
                      <span>sponsorship@cdbl.org</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                  <div className="space-y-2 text-sm">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-semibold">January 21, 2026</p>
                      <p className="text-muted-foreground">7:00 PM - Burlington Community Center</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-semibold">February 18, 2026</p>
                      <p className="text-muted-foreground">7:00 PM - Burlington Community Center</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-semibold">March 18, 2026</p>
                      <p className="text-muted-foreground">7:00 PM - Burlington Community Center</p>
                    </div>
                  </div>
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
                  <div className="space-y-2 text-sm">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-semibold">December 2025 Minutes</p>
                      <p className="text-muted-foreground text-xs">2026 budget approval, field maintenance planning</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-semibold">November 2025 Minutes</p>
                      <p className="text-muted-foreground text-xs">Travel program review, sponsorship updates</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-semibold">October 2025 Minutes</p>
                      <p className="text-muted-foreground text-xs">Season wrap-up, board election results</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Contact secretary@cdbl.org to request full meeting minutes or archived documents.
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
                    Board elections are held annually in October. Positions are open to any CDBL member in good standing.
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>Nomination Period:</strong> September 1-30</p>
                    <p><strong>Election Date:</strong> October Board Meeting</p>
                    <p><strong>Term Length:</strong> 2 years</p>
                    <p><strong>Requirements:</strong> CDBL member for 1+ year, volunteer experience preferred</p>
                  </div>
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
