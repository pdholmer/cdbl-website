import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Calendar, DollarSign, Users } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Registration = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary-light py-20 text-primary-foreground">
          <div className="container">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Register for 2026 Season</h1>
            <p className="text-xl mb-8 max-w-2xl">Join the CDBL family! Registration is now open for the 2026 baseball season.</p>
            <Button 
              size="lg" 
              variant="hero"
              onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2121019', '_blank')}
              className="bg-background text-foreground hover:bg-background/90"
            >
              Register Now on SportsConnect <ExternalLink className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* Key Information Cards */}
        <section className="py-16 bg-background">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardHeader>
                  <Calendar className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Important Dates</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>Early Registration:</strong> December 1, 2025</li>
                    <li><strong>Regular Registration:</strong> January 15, 2026</li>
                    <li><strong>Late Registration:</strong> March 1, 2026</li>
                    <li><strong>Season Starts:</strong> April 2026</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <DollarSign className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Registration Fees</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>T-Ball (Ages 4-6):</strong> $75</li>
                    <li><strong>Pinto (Ages 7-8):</strong> $95</li>
                    <li><strong>Bronco (Ages 9-10):</strong> $115</li>
                    <li><strong>Pony (Ages 11-12):</strong> $135</li>
                    <li><strong>Colt (Ages 13-14):</strong> $155</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>What's Included</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Official CDBL jersey</li>
                    <li>• Team hat</li>
                    <li>• 12-16 game season</li>
                    <li>• Professional coaching</li>
                    <li>• Tournament opportunities</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Programs Section */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Choose Your Program</h2>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">In-House League</CardTitle>
                  <CardDescription>Recreational baseball for all skill levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Perfect for players developing their skills in a fun, supportive environment. Games are played locally at CDBL fields.
                  </p>
                  <ul className="space-y-2 text-muted-foreground mb-6">
                    <li>• Ages 4-14</li>
                    <li>• Weekly practices and games</li>
                    <li>• Parent coaching opportunities</li>
                    <li>• Emphasis on fun and fundamentals</li>
                  </ul>
                  <Button 
                    className="w-full"
                    onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2121019', '_blank')}
                  >
                    Register for In-House
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Travel Baseball</CardTitle>
                  <CardDescription>Competitive play for experienced players</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    For players ready to compete at a higher level. Teams travel to tournaments and play against top competition.
                  </p>
                  <ul className="space-y-2 text-muted-foreground mb-6">
                    <li>• Ages 8-14</li>
                    <li>• Tryout required</li>
                    <li>• Tournament schedule</li>
                    <li>• Advanced coaching and training</li>
                  </ul>
                  <Button 
                    className="w-full"
                    onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2121019', '_blank')}
                  >
                    Register for Travel
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How to Register Section */}
        <section className="py-16 bg-background">
          <div className="container max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">How to Register</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Visit SportsConnect</h3>
                  <p className="text-muted-foreground">Click the "Register Now" button to access our registration system powered by SportsConnect.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Create or Log In</h3>
                  <p className="text-muted-foreground">Create a new account or log in if you've registered with CDBL before.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Complete Player Information</h3>
                  <p className="text-muted-foreground">Fill out your child's information, select their division, and choose your preferred program.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">4</div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Submit Payment</h3>
                  <p className="text-muted-foreground">Pay your registration fee securely online. Payment plans may be available.</p>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Button 
                size="lg" 
                variant="hero"
                onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2121019', '_blank')}
              >
                Start Registration <ExternalLink className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Registration;