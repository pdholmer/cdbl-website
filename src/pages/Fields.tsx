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

        {/* Plato Fields */}
        <section className="py-16 bg-background">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">Plato Fields</h2>
            
            <div className="grid lg:grid-cols-2 gap-12 mb-12">
              <div>
                <div className="aspect-video bg-muted rounded-lg mb-6 flex items-center justify-center">
                  <iframe
                    title="Plato Fields Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d955!2d-88.4235169!3d42.0260302!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880f1909b0af698b%3A0xf49d7e6dea495e0d!2sCentral%20District%20Baseball%20League%20-%20Plato%20Center%20Baseball%20Fields_CDBL!5e0!3m2!1sen!2sus!4v1234567890"
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
                    <p className="text-lg">Plato Fields</p>
                    <p className="text-muted-foreground">41 Russell Road</p>
                    <p className="text-muted-foreground">Elgin, IL 60124</p>
                    <button
                      onClick={() => window.open('https://www.google.com/maps/place/Central+District+Baseball+League+-+Plato+Center+Baseball+Fields_CDBL/@42.0260302,-88.4235169,955m/data=!3m1!1e3!4m15!1m8!3m7!1s0x880f1975b98762f7:0x1e26b4da855f5fff!2s41W119+Russell+Rd,+Elgin,+IL+60124!3b1!8m2!3d42.025995!4d-88.417667!16s%2Fg%2F11txhyr6hf!3m5!1s0x880f1909b0af698b:0xf49d7e6dea495e0d!8m2!3d42.0262779!4d-88.4276901!16s%2Fg%2F11dy_7v5_3?entry=ttu', '_blank')}
                      className="mt-4 text-primary hover:text-primary/80 flex items-center gap-2 font-semibold"
                    >
                      <Navigation className="h-4 w-4" />
                      Get Directions
                    </button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Plato Individual Fields */}
            <h3 className="text-2xl font-bold mb-6">Field Details</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Field 1</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold mb-2">Bronco</p>
                  <p className="text-muted-foreground text-sm">Main Bronco division field at Plato</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Field 2</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold mb-2">Mustang</p>
                  <p className="text-muted-foreground text-sm">Primary Mustang division field</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Field 3</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold mb-2">Pinto</p>
                  <p className="text-muted-foreground text-sm">Dedicated Pinto division field</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Field 4</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold mb-2">T-Ball</p>
                  <p className="text-muted-foreground text-sm">T-Ball division field</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Stonecrest Fields */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">Stonecrest Fields</h2>
            
            <div className="grid lg:grid-cols-2 gap-12 mb-12">
              <div>
                <div className="aspect-video bg-muted rounded-lg mb-6 flex items-center justify-center">
                  <iframe
                    title="Stonecrest Fields Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d422!2d-88.4039311!3d42.0321119!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880f1980b7e80c35%3A0x4d067a07a408cab1!2sPlato%20Park%20(Stonecrest)!5e0!3m2!1sen!2sus!4v1234567890"
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
                    <p className="text-lg">Stonecrest Fields</p>
                    <p className="text-muted-foreground">4W400 Stonecrest Drive</p>
                    <p className="text-muted-foreground">Elgin, IL 60124</p>
                    <button
                      onClick={() => window.open('https://www.google.com/maps/place/Plato+Park+(Stonecrest)/@42.0321119,-88.4039311,422m/data=!3m1!1e3!4m10!1m2!2m1!1sstonecrest+Fields!3m6!1s0x880f1980b7e80c35:0x4d067a07a408cab1!8m2!3d42.031945!4d-88.4027598!15sChFzdG9uZWNyZXN0IEZpZWxkc1oTIhFzdG9uZWNyZXN0IGZpZWxkc5IBDmJhc2ViYWxsX2ZpZWxkmgEjQ2haRFNVaE5NRzluUzBWSlEwRm5TVVJQTWw5WGJsaFJFQUWqAVEQASoVIhFzdG9uZWNyZXN0IGZpZWxkcygAMh8QASIbpzNIfuXOKQIl-LCdc_3D1Q7F_18-9fQVdqsdMhUQAiIRc3RvbmVjcmVzdCBmaWVsZHPgAQD6AQQIABBL!16s%2Fg%2F119wfd2s9?entry=ttu', '_blank')}
                      className="mt-4 text-primary hover:text-primary/80 flex items-center gap-2 font-semibold"
                    >
                      <Navigation className="h-4 w-4" />
                      Get Directions
                    </button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Stonecrest Individual Fields */}
            <h3 className="text-2xl font-bold mb-6">Field Details</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Field 1</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold mb-2">Bronco</p>
                  <p className="text-muted-foreground text-sm">Bronco division field at Stonecrest</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Field 2</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold mb-2">Mustang</p>
                  <p className="text-muted-foreground text-sm">Mustang division field</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Field 4</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold mb-2">Pony / Colt</p>
                  <p className="text-muted-foreground text-sm">Shared field for Pony and Colt divisions</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Burlington Fields */}
        <section className="py-16 bg-background">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">Burlington Fields</h2>
            
            <div className="grid lg:grid-cols-2 gap-12 mb-12">
              <div>
                <div className="aspect-video bg-muted rounded-lg mb-6 flex items-center justify-center">
                  <iframe
                    title="Burlington Fields Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.5!2d-88.5!3d42.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z12N475%20Park%20St%2CBurlington%2CIL%2060109!5e0!3m2!1sen!2sus!4v1234567890"
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
                    <p className="text-lg">Burlington Fields</p>
                    <p className="text-muted-foreground">12N475 Park St</p>
                    <p className="text-muted-foreground">Burlington, IL 60109</p>
                    <button
                      onClick={() => window.open('http://maps.google.com/maps?q=12N475%20Park%20St,Burlington,Illinois,United%20States,60109', '_blank')}
                      className="mt-4 text-primary hover:text-primary/80 flex items-center gap-2 font-semibold"
                    >
                      <Navigation className="h-4 w-4" />
                      Get Directions
                    </button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Burlington Individual Fields */}
            <h3 className="text-2xl font-bold mb-6">Field Details</h3>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
              <Card>
                <CardHeader>
                  <CardTitle>Burlington Upper</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold mb-2">Mustang / Pinto</p>
                  <p className="text-muted-foreground text-sm">Upper field for Mustang and Pinto divisions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Burlington Lower</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold mb-2">Bronco</p>
                  <p className="text-muted-foreground text-sm">Lower field for Bronco division</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Visitor Information */}
        <section className="py-16 bg-muted/30">
          <div className="container max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Visitor Information</h2>
            
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Arrive 30 minutes before game time for parking and warmups</li>
                  <li>• Pets must be leashed at all times</li>
                  <li>• No glass containers permitted on field grounds</li>
                  <li>• Follow all posted speed limits within field complexes</li>
                  <li>• Designated areas for team warmups - check with coaches</li>
                </ul>
              </CardContent>
            </Card>
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
                    <p className="font-semibold mb-2">Field Maintenance Issues</p>
                    <p className="text-muted-foreground">Contact the grounds committee through your division coordinator</p>
                    <p className="text-xs text-muted-foreground mt-2">Include: Field location and number, issue description, date/time, your name</p>
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