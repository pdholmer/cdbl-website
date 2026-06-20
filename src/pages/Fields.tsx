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
          className="relative py-12 md:py-16 text-primary-foreground overflow-hidden"
          style={{ background: 'var(--gradient-hero)' }}
        >
          <div className="container">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Fields & Facilities</h1>
            <p className="text-lg max-w-2xl mb-4">Find directions to all CDBL baseball fields and check current field conditions.</p>
            <button
              onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2224586', '_blank')}
              className="bg-white text-primary hover:bg-white/90 px-5 py-2.5 rounded-lg font-semibold shadow-lg transition-colors text-sm"
            >
              Check Field Status
            </button>
          </div>
        </section>

        {/* Status Alert */}
        {hasClosedFields && (
          <section className="py-4 bg-background">
            <div className="container">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-destructive text-sm">Field Status Alert</h3>
                  <p className="text-xs text-muted-foreground">
                    Some fields are currently closed or under maintenance. Check individual field status below.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Loading State */}
        {isLoading && (
          <section className="py-8 bg-background">
            <div className="container">
              <div className="text-center text-muted-foreground">Loading facility information...</div>
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
              className={`py-8 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}
            >
              <div className="container">
                <h2 className="text-2xl font-bold mb-6">{venue.name}</h2>
                
                <div className="grid lg:grid-cols-2 gap-6 mb-6">
                  {/* Map */}
                  <div className="aspect-[16/10] bg-muted rounded-lg overflow-hidden">
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

                  {/* Info - inline, no card */}
                  <div className="flex flex-col justify-center space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">{venue.name}</p>
                        <p className="text-sm text-muted-foreground">{venue.address}</p>
                        <p className="text-sm text-muted-foreground">
                          {venue.city}, {venue.state} {venue.zip_code}
                        </p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex gap-2 flex-wrap">
                      {venue.has_lights && <Badge variant="outline">Lights</Badge>}
                      {venue.has_restrooms && <Badge variant="outline">Restrooms</Badge>}
                      {venue.has_concessions && <Badge variant="outline">Concessions</Badge>}
                    </div>

                    <button
                      onClick={() => window.open(googleMapsUrl, '_blank')}
                      className="text-primary hover:text-primary/80 flex items-center gap-1.5 font-semibold text-sm w-fit"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      Get Directions
                    </button>

                    {/* Fields - compact table rows */}
                    {venueFields.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold mb-2">Fields</h3>
                        <div className="border rounded-lg overflow-hidden divide-y">
                          {venueFields.map((field) => (
                            <div key={field.id} className="flex items-center gap-3 px-3 py-2 bg-card text-sm">
                              <span className="font-medium min-w-[120px]">
                                {field.field_name || `Field ${field.field_number}`}
                              </span>
                              {field.divisions && field.divisions.length > 0 && (
                                <span className="text-muted-foreground text-xs">
                                  {field.divisions.join(" / ")}
                                </span>
                              )}
                              <span className="ml-auto flex items-center gap-2">
                                {field.notes && field.status !== "open" && (
                                  <span className="text-xs text-destructive">{field.notes}</span>
                                )}
                                {getStatusBadge(field.status)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          );
        })}

        {/* Bottom sections side-by-side */}
        <section className="py-8 bg-muted/30">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Visitor Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Visitor Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    <li>• Arrive 30 minutes before game time for parking and warmups</li>
                    <li>• <strong>No pets at Plato Fields</strong> (per facility rules)</li>
                    <li>• Pets allowed at Stonecrest and Burlington Central — must be leashed at all times</li>
                    <li>• <strong>No pets at any facility during tournaments</strong>, regardless of location</li>
                    <li>• <strong>No tents, canopies, or similar structures in parking areas</strong> — these must be set up in designated spectator areas only and may not block vehicle or pedestrian traffic</li>
                    <li>• <strong>Personal grills and open flames prohibited</strong> on all CDBL facility grounds</li>
                    <li>• Only CDBL-approved concessions may use commercial cooking equipment in designated areas</li>
                    <li>• No glass containers permitted on field grounds</li>
                    <li>• Follow all posted speed limits within field complexes</li>
                    <li>• Designated areas for team warmups - check with coaches</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Coach Resources */}
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">For Coaches</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-card rounded-lg">
                    <p className="font-semibold text-sm mb-1">Field Maintenance Issues</p>
                    <p className="text-xs text-muted-foreground">Contact the grounds committee through your division coordinator</p>
                    <p className="text-xs text-muted-foreground mt-1">Include: Field location, issue description, date/time, your name</p>
                  </div>
                  <div className="p-3 bg-card rounded-lg">
                    <p className="font-semibold text-sm mb-1">Weather-Related Cancellations</p>
                    <p className="text-xs text-muted-foreground mb-2">Check field status updates 2 hours before game time</p>
                    <button
                      onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2224586', '_blank')}
                      className="text-primary hover:text-primary/80 font-semibold text-xs underline"
                    >
                      View Field Status on Sports Connect →
                    </button>
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
}
