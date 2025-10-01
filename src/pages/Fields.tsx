import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, Phone, AlertTriangle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WeatherDisplay from "@/components/WeatherDisplay";

const Fields = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary-light py-20 text-primary-foreground">
          <div className="container">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Fields & Facilities</h1>
            <p className="text-xl max-w-2xl">Find directions to all CDBL baseball fields and check current field conditions.</p>
          </div>
        </section>

        {/* Weather & Field Status */}
        <section className="py-12 bg-muted/30">
          <div className="container">
            <div className="bg-card rounded-lg p-6 shadow-lg max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-primary" />
                Current Field Status
              </h2>
              <div className="mb-4">
                <WeatherDisplay />
              </div>
              <p className="text-muted-foreground mb-4">
                For the most up-to-date field status information, including weather-related updates and cancellations, please check our Sports Connect portal.
              </p>
              <button
                onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2224586', '_blank')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Check Field Status on Sports Connect
              </button>
            </div>
          </div>
        </section>

        {/* Main Complex */}
        <section className="py-16 bg-background">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">CDBL Main Complex</h2>
            
            <div className="grid lg:grid-cols-2 gap-12 mb-12">
              <div>
                <div className="aspect-video bg-muted rounded-lg mb-6 flex items-center justify-center">
                  <iframe
                    title="CDBL Main Complex Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.5!2d-88.5!3d42.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDLCsDAwJzAwLjAiTiA4OMKwMzAnMDAuMCJX!5e0!3m2!1sen!2sus!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0, borderRadius: '0.5rem' }}
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg">CDBL Baseball Complex</p>
                    <p className="text-muted-foreground">Burlington, IL 60109</p>
                    <button
                      onClick={() => window.open('https://maps.google.com/?q=Burlington+IL+baseball', '_blank')}
                      className="mt-4 text-primary hover:text-primary/80 flex items-center gap-2 font-semibold"
                    >
                      <Navigation className="h-4 w-4" />
                      Get Directions
                    </button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-primary" />
                      Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">For field availability or maintenance issues:</p>
                    <p className="text-lg font-semibold mt-2">Field Hotline: (555) 123-4567</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Individual Fields */}
            <h3 className="text-2xl font-bold mb-6">Field Details</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Field 1</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>Size:</strong> T-Ball / Pinto</li>
                    <li><strong>Surface:</strong> Grass</li>
                    <li><strong>Lights:</strong> No</li>
                    <li><strong>Bleachers:</strong> Yes (2)</li>
                    <li><strong>Dugouts:</strong> Covered</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Field 2</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>Size:</strong> Bronco (60/45)</li>
                    <li><strong>Surface:</strong> Grass</li>
                    <li><strong>Lights:</strong> Yes</li>
                    <li><strong>Bleachers:</strong> Yes (3)</li>
                    <li><strong>Dugouts:</strong> Covered</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Field 3</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>Size:</strong> Pony (70/50)</li>
                    <li><strong>Surface:</strong> Grass</li>
                    <li><strong>Lights:</strong> Yes</li>
                    <li><strong>Bleachers:</strong> Yes (4)</li>
                    <li><strong>Dugouts:</strong> Covered</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Championship Field</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>Size:</strong> Colt (80/60)</li>
                    <li><strong>Surface:</strong> Grass</li>
                    <li><strong>Lights:</strong> Yes</li>
                    <li><strong>Bleachers:</strong> Yes (6)</li>
                    <li><strong>Dugouts:</strong> Covered</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Amenities */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Complex Amenities</h2>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Concessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Full-service concession stand open during games and tournaments.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Parking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Ample free parking available adjacent to all fields.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Restrooms</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Clean restroom facilities centrally located in the complex.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Directions & Tips */}
        <section className="py-16 bg-background">
          <div className="container max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Directions & Tips</h2>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>From I-88 East/West</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Take Exit 98 for IL-47 toward Elburn/Sugar Grove</li>
                    <li>Turn left onto IL-47 N</li>
                    <li>Continue for 2.5 miles</li>
                    <li>Turn right at CDBL Complex sign</li>
                  </ol>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Visitor Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Arrive 30 minutes before game time for parking and warmups</li>
                    <li>• Pets must be leashed at all times</li>
                    <li>• No glass containers permitted on complex grounds</li>
                    <li>• Follow all posted speed limits (10 mph) within the complex</li>
                    <li>• Designated areas for team warmups - check with field marshal</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Coach Resources - Field Status Reporting */}
        <section className="py-16 bg-muted/30">
          <div className="container max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">For Coaches</h2>
            
            <Card className="bg-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle>Field Status & Maintenance Reporting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Coaches: If you notice field issues (standing water, damaged equipment, unsafe conditions), please report them immediately:
                </p>
                <div className="space-y-3 text-sm">
                  <div className="p-4 bg-card rounded-lg">
                    <p className="font-semibold mb-2">Emergency Issues (Unsafe Conditions)</p>
                    <p className="text-muted-foreground">Call Field Hotline: <span className="font-bold text-foreground">(555) 123-4567</span></p>
                  </div>
                  <div className="p-4 bg-card rounded-lg">
                    <p className="font-semibold mb-2">Non-Emergency Maintenance</p>
                    <p className="text-muted-foreground">Email: <span className="font-bold text-foreground">fieldops@cdbl.org</span></p>
                    <p className="text-xs text-muted-foreground mt-2">Include: Field number, issue description, date/time, your name</p>
                  </div>
                  <div className="p-4 bg-card rounded-lg">
                    <p className="font-semibold mb-2">Weather-Related Cancellations</p>
                    <p className="text-muted-foreground mb-3">Check field status updates 2 hours before game time or contact your division coordinator</p>
                    <button
                      onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2224586', '_blank')}
                      className="text-primary hover:text-primary/80 font-semibold underline"
                    >
                      View Field Status on Sports Connect →
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Fields;