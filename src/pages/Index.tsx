import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import RegistrationSection from "@/components/RegistrationSection";
import SpiritWearSection from "@/components/SpiritWearSection";
import UmpiresSection from "@/components/UmpiresSection";
import SponsorsSection from "@/components/SponsorsSection";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        
        {/* Quick Help CTA */}
        <section className="py-4 bg-muted">
          <div className="container">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold mb-2">Questions About Registration or Programs?</h3>
                <p className="text-muted-foreground">
                  New to CDBL? <Link to="/new-to-cdbl" className="underline hover:no-underline font-semibold">Start here</Link> or contact us for help.
                </p>
              </div>
              <Button 
                size="lg" 
                variant="default"
                asChild
                className="flex-shrink-0"
              >
                <Link to="/contact">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <AboutSection />
        <RegistrationSection />
        <SpiritWearSection />
        <UmpiresSection />
        <SponsorsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
