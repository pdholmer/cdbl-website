import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Facebook, Instagram } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Contact = () => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent!",
      description: "We'll get back to you as soon as possible.",
    });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary-light py-20 text-primary-foreground">
          <div className="container">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl max-w-2xl">Have questions? We're here to help! Reach out to the CDBL team anytime.</p>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-16 bg-background">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Contact Form */}
              <div>
                <h2 className="text-3xl font-bold mb-6">Send Us a Message</h2>
                <Card>
                  <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input 
                          id="name" 
                          placeholder="Your name" 
                          required 
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="your.email@example.com" 
                          required 
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input 
                          id="phone" 
                          type="tel" 
                          placeholder="(555) 123-4567" 
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject *</Label>
                        <Input 
                          id="subject" 
                          placeholder="What is this regarding?" 
                          required 
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea 
                          id="message" 
                          placeholder="Tell us how we can help..."
                          rows={5}
                          required 
                        />
                      </div>

                      <Button type="submit" size="lg" className="w-full">
                        Send Message
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary" />
                        Email
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <a 
                        href="mailto:info@cdbaseball.org" 
                        className="text-lg text-primary hover:text-primary/80"
                      >
                        info@cdbaseball.org
                      </a>
                      <p className="text-sm text-muted-foreground mt-2">
                        We typically respond within 24-48 hours
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5 text-primary" />
                        Phone
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-semibold">Field Hotline</p>
                      <p className="text-lg text-primary">(555) 123-4567</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        For field status and cancellations
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Location
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-semibold">CDBL Baseball Complex</p>
                      <p className="text-muted-foreground">Burlington, IL 60109</p>
                      <button
                        onClick={() => window.open('https://maps.google.com/?q=Burlington+IL+baseball', '_blank')}
                        className="mt-3 text-primary hover:text-primary/80 font-semibold"
                      >
                        Get Directions →
                      </button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Connect on Social Media</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4">
                        <a
                          href="https://facebook.com/cdbl"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary hover:text-primary/80"
                        >
                          <Facebook className="h-5 w-5" />
                          <span>Facebook</span>
                        </a>
                        <a
                          href="https://instagram.com/cdbl"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary hover:text-primary/80"
                        >
                          <Instagram className="h-5 w-5" />
                          <span>Instagram</span>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Contacts */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Board Members & Key Contacts</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>President</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-lg">John Smith</p>
                  <a href="mailto:president@cdbaseball.org" className="text-primary text-sm">
                    president@cdbaseball.org
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vice President</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-lg">Lisa Davis</p>
                  <a href="mailto:vp@cdbaseball.org" className="text-primary text-sm">
                    vp@cdbaseball.org
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Treasurer</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-lg">Sarah Johnson</p>
                  <a href="mailto:treasurer@cdbaseball.org" className="text-primary text-sm">
                    treasurer@cdbaseball.org
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Player Agent</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-lg">Mike Chen</p>
                  <a href="mailto:playeragent@cdbaseball.org" className="text-primary text-sm">
                    playeragent@cdbaseball.org
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Travel Coordinator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-lg">Dave Martinez</p>
                  <a href="mailto:travel@cdbaseball.org" className="text-primary text-sm">
                    travel@cdbaseball.org
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sponsorship</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-lg">Amy Wilson</p>
                  <a href="mailto:sponsors@cdbaseball.org" className="text-primary text-sm">
                    sponsors@cdbaseball.org
                  </a>
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

export default Contact;