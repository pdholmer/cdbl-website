import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Users, Trophy, DollarSign } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const Donate = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !leftColumnRef.current) return;

      const section = sectionRef.current;
      const leftColumn = leftColumnRef.current;
      const sectionRect = section.getBoundingClientRect();
      const leftColumnRect = leftColumn.getBoundingClientRect();

      // Check if section is in viewport
      const sectionInView = sectionRect.top <= 100 && sectionRect.bottom > window.innerHeight;

      if (sectionInView) {
        // Check if left column has scrolled to bottom
        const isAtBottom = leftColumn.scrollHeight - leftColumn.scrollTop <= leftColumn.clientHeight + 10;
        
        if (!isAtBottom && !isLocked) {
          setIsLocked(true);
          document.body.style.overflow = 'hidden';
        } else if (isAtBottom && isLocked) {
          setIsLocked(false);
          document.body.style.overflow = 'auto';
        }
      } else if (isLocked) {
        setIsLocked(false);
        document.body.style.overflow = 'auto';
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (!isLocked || !leftColumnRef.current) return;

      const leftColumn = leftColumnRef.current;
      const isAtBottom = leftColumn.scrollHeight - leftColumn.scrollTop <= leftColumn.clientHeight + 10;
      const isAtTop = leftColumn.scrollTop <= 0;

      if ((e.deltaY > 0 && isAtBottom) || (e.deltaY < 0 && isAtTop)) {
        setIsLocked(false);
        document.body.style.overflow = 'auto';
      } else {
        e.preventDefault();
        leftColumn.scrollTop += e.deltaY;
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      document.body.style.overflow = 'auto';
    };
  }, [isLocked]);
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section 
          className="relative py-16 md:py-24 text-primary-foreground overflow-hidden"
          style={{ background: 'var(--gradient-hero)' }}
        >
          <div className="container">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">Support CDBL</h1>
              <p className="text-xl max-w-2xl">
                Help us provide exceptional youth baseball programs for all families in Burlington & Plato Center, IL
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section ref={sectionRef} className="py-12 md:py-16">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              
              {/* Left Column - Educational Content */}
              <div 
                ref={leftColumnRef}
                className="space-y-8 overflow-y-auto"
                style={{ maxHeight: isLocked ? 'calc(100vh - 200px)' : 'none' }}
              >
                
                {/* Why Donate */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-primary" />
                      Why Donate to CDBL?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Central District Baseball League is a <strong>501(c)(3) non-profit organization</strong> that has been serving Burlington since 1987. All donations are tax-deductible and go directly toward supporting youth baseball in our community.
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm">
                        ✓ 100% volunteer-run organization
                      </p>
                      <p className="text-sm">
                        ✓ Serving 400+ players annually
                      </p>
                      <p className="text-sm">
                        ✓ 38 years of community service
                      </p>
                      <p className="text-sm">
                        ✓ All donations are tax-deductible
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Impact of Donation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      Impact of Your Donation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Your generous contribution helps us:
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Maintain and improve our playing fields</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Purchase quality equipment (bats, balls, helmets, catcher's gear)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Provide scholarship programs for families in need</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Keep registration fees affordable for all families</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Support umpire training and development</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Fund coach education programs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Upgrade facilities (lighting, dugouts, fencing)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Host competitive tournaments</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Donation Levels */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      Suggested Donation Levels
                    </CardTitle>
                    <CardDescription>
                      Every contribution makes a difference - donate any amount you wish
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="font-medium">$25</span>
                        <span className="text-muted-foreground">Equipment Fund</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="font-medium">$50</span>
                        <span className="text-muted-foreground">Scholarship Support</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="font-medium">$100</span>
                        <span className="text-muted-foreground">Field Maintenance</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="font-medium">$250</span>
                        <span className="text-muted-foreground">Team Sponsor</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="font-medium">$500+</span>
                        <span className="text-muted-foreground">Major Donor</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Transparency */}
                <Card>
                  <CardHeader>
                    <CardTitle>Our Commitment to Transparency</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm">
                      CDBL is proud to be a 100% volunteer-run organization. Our board members donate their time and expertise with zero compensation. Every dollar you donate goes directly toward improving the experience for our young athletes.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span><strong>No administrative overhead</strong> goes to salaries</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span><strong>Volunteer board</strong> of community members</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span><strong>Recent improvements</strong> funded by donations include field upgrades and new equipment</span>
                      </li>
                    </ul>
                    <Button variant="link" asChild className="p-0 h-auto">
                      <Link to="/board">View our Board of Directors →</Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Other Ways to Support */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Other Ways to Support CDBL
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <Button variant="outline" asChild className="justify-start h-auto py-4">
                        <Link to="/volunteer" className="flex flex-col items-start gap-1">
                          <span className="font-semibold">Volunteer Your Time</span>
                          <span className="text-xs text-muted-foreground font-normal">Coach, umpire, or help with events</span>
                        </Link>
                      </Button>
                      <Button variant="outline" asChild className="justify-start h-auto py-4">
                        <Link to="/sponsors" className="flex flex-col items-start gap-1">
                          <span className="font-semibold">Become a Sponsor</span>
                          <span className="text-xs text-muted-foreground font-normal">Support teams and programs</span>
                        </Link>
                      </Button>
                      <Button variant="outline" asChild className="justify-start h-auto py-4">
                        <Link to="/shop" className="flex flex-col items-start gap-1">
                          <span className="font-semibold">Shop Spirit Wear</span>
                          <span className="text-xs text-muted-foreground font-normal">Proceeds support the league</span>
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

              </div>

              {/* Right Column - Zeffy Donation Form */}
              <div className="lg:sticky lg:top-24 h-fit">
                <Card>
                  <CardHeader>
                    <CardTitle>Make a Donation</CardTitle>
                    <CardDescription>
                      Secure donation processing powered by Zeffy - 100% of your donation goes to CDBL
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border border-border overflow-hidden">
                      <iframe 
                        title="Donation form powered by Zeffy" 
                        style={{ 
                          border: 0, 
                          width: '100%',
                          height: '900px',
                          display: 'block'
                        }} 
                        src="https://www.zeffy.com/embed/donation-form/cdbl-test-campaign"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default Donate;
