import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin, AlertTriangle, Navigation } from "lucide-react";
import { useVenues } from "@/hooks/useVenues";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Fields() {
  const { data: venues = [], isLoading } = useVenues({ status: "active" });
  
  const { data: allFields = [] } = useQuery({
    queryKey: ["all-venue-fields"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venue_fields")
        .select("*, venues!inner(name, status)")
        .eq("venues.status", "active")
        .order("field_number", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const getFieldsByVenue = (venueId: string) => {
    return allFields.filter((field) => field.venue_id === venueId);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      open: { variant: "default", label: "Open" },
      closed: { variant: "destructive", label: "Closed" },
      maintenance: { variant: "secondary", label: "Maintenance" },
    };
    const config = variants[status] || variants.open;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const hasClosedFields = allFields.some((field) => field.status !== "open");

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
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Fields & Facilities</h1>
            <p className="text-xl max-w-2xl mb-6">Find directions to all CDBL baseball fields and check current field conditions.</p>
            <button
              onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2224586', '_blank')}
              className="bg-white text-primary hover:bg-white/90 px-6 py-3 rounded-lg font-semibold shadow-lg transition-colors"
            >
              Check Field Status
            </button>
          </div>
        </section>

        {/* Status Alert */}
        {hasClosedFields && (
          <section className="py-6 bg-background">
            <div className="container">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-destructive mb-1">Field Status Alert</h3>
                  <p className="text-sm text-muted-foreground">
                    Some fields are currently closed or under maintenance. Please check individual field status below.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Loading State */}
        {isLoading && (
          <section className="py-12 bg-background">
            <div className="container">
              <div className="text-center">Loading venue information...</div>
            </div>
          </section>
        )}

        {/* Venues */}
        {venues.map((venue, index) => {
          const venueFields = getFieldsByVenue(venue.id);
          const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${venue.address}, ${venue.city}, ${venue.state} ${venue.zip_code}`
          )}`;

          return (
            <section 
              key={venue.id} 
              className={`py-16 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}
            >
              <div className="container">
                <h2 className="text-3xl md:text-4xl font-bold mb-12">{venue.name}</h2>
                
                <div className="grid lg:grid-cols-2 gap-12 mb-12">
                  {/* Map */}
                  <div>
                    <div className="aspect-video bg-muted rounded-lg mb-6 flex items-center justify-center overflow-hidden">
                      <iframe
                        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(
                          `${venue.address}, ${venue.city}, ${venue.state} ${venue.zip_code}`
                        )}`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`${venue.name} Location`}
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          Address
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg">{venue.name}</p>
                        <p className="text-muted-foreground">{venue.address}</p>
                        <p className="text-muted-foreground">
                          {venue.city}, {venue.state} {venue.zip_code}
                        </p>

                        {/* Features */}
                        <div className="flex gap-2 mt-4 flex-wrap">
                          {venue.has_lights && <Badge variant="outline">Lights</Badge>}
                          {venue.has_restrooms && <Badge variant="outline">Restrooms</Badge>}
                          {venue.has_concessions && <Badge variant="outline">Concessions</Badge>}
                        </div>

                        <button
                          onClick={() => window.open(googleMapsUrl, '_blank')}
                          className="mt-4 text-primary hover:text-primary/80 flex items-center gap-2 font-semibold"
                        >
                          <Navigation className="h-4 w-4" />
                          Get Directions
                        </button>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Fields */}
                {venueFields.length > 0 && (
                  <>
                    <h3 className="text-2xl font-bold mb-6">Field Details</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {venueFields.map((field) => (
                        <Card key={field.id}>
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              {field.field_name || `Field ${field.field_number}`}
                              {getStatusBadge(field.status)}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {field.divisions && field.divisions.length > 0 && (
                              <p className="text-lg font-semibold mb-2">
                                {field.divisions.join(" / ")}
                              </p>
                            )}
                            {field.notes && field.status !== "open" && (
                              <p className="text-sm text-destructive mt-2">{field.notes}</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>
          );
        })}

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

        {/* Coach Resources */}
        <section className="py-16 bg-background">
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
}
