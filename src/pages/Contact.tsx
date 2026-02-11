import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Facebook, Instagram, CheckCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Contact = () => {
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Get pre-filled subject from URL params
  const prefillSubject = searchParams.get("subject") || "";
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: prefillSubject,
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("contact_messages")
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          subject: formData.subject,
          message: formData.message,
        });

      if (error) throw error;

      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting contact form:", error);
      // Show inline error instead of toast for persistence
      alert("Something went wrong. Please try again or email us directly at Communications@cdbaseball.org");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendAnother = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section
          className="relative py-16 md:py-24 text-primary-foreground overflow-hidden"
          style={{ background: "var(--gradient-hero)" }}
        >
          <div className="container">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl max-w-2xl">
              Have questions? We're here to help! Reach out to the CDBL team anytime.
            </p>
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
                    {isSubmitted ? (
                      <div className="text-center py-8 space-y-4 animate-in fade-in-50 slide-in-from-bottom-2">
                        <div className="inline-flex p-4 rounded-full bg-green-100 mb-4">
                          <CheckCircle className="h-12 w-12 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-green-700">Message Sent!</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          Thank you for reaching out. We typically respond within 24-48 hours. 
                          Check your email ({formData.email}) for our response.
                        </p>
                        <div className="pt-4">
                          <Button variant="outline" onClick={handleSendAnother}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Send Another Message
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your name"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your.email@example.com"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="(555) 123-4567"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject *</Label>
                          <Input
                            id="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="What is this regarding?"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">Message *</Label>
                          <Textarea
                            id="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Tell us how we can help..."
                            rows={5}
                            required
                          />
                        </div>

                        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                          {isSubmitting ? "Sending..." : "Send Message"}
                        </Button>
                      </form>
                    )}
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
                        href="mailto:Communications@cdbaseball.org"
                        className="text-lg text-primary hover:text-primary/80"
                      >
                        Communications@cdbaseball.org
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
                      <p className="text-lg font-semibold">Phone</p>
                      <a href="tel:8475313237" className="text-lg text-primary hover:text-primary/80">847-531-3237</a>
                      <p className="text-sm text-muted-foreground mt-2">
                        For field status and cancellations
                      </p>
                      <button
                        onClick={() =>
                          window.open(
                            "https://leagues.bluesombrero.com/Default.aspx?tabid=2224586",
                            "_blank"
                          )
                        }
                        className="mt-3 text-primary hover:text-primary/80 font-semibold underline text-sm"
                      >
                        Check Field Status Online →
                      </button>
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
                      <p className="text-muted-foreground">Plato Center, IL</p>
                      <button
                        onClick={() =>
                          window.open(
                            "https://maps.google.com/?q=Burlington+IL+baseball",
                            "_blank"
                          )
                        }
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
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Board Members & Key Contacts
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>President</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-lg">Jason Taylor</p>
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
                  <p className="font-semibold text-lg">Carrie Wolak</p>
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
                  <p className="font-semibold text-lg">Todd Weachter</p>
                  <a href="mailto:treasurer@cdbaseball.org" className="text-primary text-sm">
                    treasurer@cdbaseball.org
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Travel Coordinator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-lg">Bobby Rogers & Carrie Wolak</p>
                  <a href="mailto:travel@cdbaseball.org" className="text-primary text-sm">
                    travel@cdbaseball.org
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
