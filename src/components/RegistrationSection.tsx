import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import playerPitching from "@/assets/player-pitching.jpg";
import { Calendar, ClipboardList, Users } from "lucide-react";
import ScrollIndicator from "@/components/ScrollIndicator";

const RegistrationSection = () => {
  return (
    <section id="registration" className="relative min-h-[calc(100vh-136px)] scroll-snap-align-start py-12 md:py-20 overflow-hidden flex items-center"
             style={{ background: 'var(--gradient-subtle)' }}>
      <div className="container">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
            Travel Player Registration
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            Join the Rockets and take your baseball skills to the next level
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-6 md:gap-8 items-center mb-8 md:mb-12">
          <div className="md:col-span-2">
            <img 
              src={playerPitching} 
              alt="Youth player pitching" 
              className="rounded-xl shadow-[var(--shadow-elevated)] w-full h-auto"
            />
          </div>
          <div className="md:col-span-3 bg-white p-6 md:p-8 rounded-xl shadow-[var(--shadow-card)] border border-carolina/20">
            <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">2026 Travel & Part-Time Tryouts</h3>
            <p className="text-base md:text-lg mb-4 md:mb-6 leading-relaxed">
              Please register here for the 2026 Travel and Part-Time Tryouts. Players are required to register to be considered for a Travel or Part-Time Travel position – even if unable to make the tryout.
            </p>
            <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8">
              All registration, schedules, and field status information is managed through our Sports Connect portal powered by BlueSombrero.
            </p>
            <Button 
              variant="hero" 
              size="lg" 
              className="w-full"
              onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2121019', '_blank')}
            >
              Register for Travel Baseball
            </Button>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 md:gap-6">
          <div className="text-center p-5 md:p-6 bg-white rounded-lg shadow-sm border border-border hover:shadow-md transition-all">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-carolina/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <Calendar className="w-6 h-6 md:w-7 md:h-7 text-carolina" />
            </div>
            <h4 className="text-base md:text-lg font-bold mb-2">Flexible Scheduling</h4>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Games and practices scheduled around family commitments
            </p>
          </div>
          <div className="text-center p-5 md:p-6 bg-white rounded-lg shadow-sm border border-border hover:shadow-md transition-all">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <Users className="w-6 h-6 md:w-7 md:h-7 text-primary" />
            </div>
            <h4 className="text-base md:text-lg font-bold mb-2">Expert Coaching</h4>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Experienced coaches dedicated to player development
            </p>
          </div>
          <div className="text-center p-5 md:p-6 bg-white rounded-lg shadow-sm border border-border hover:shadow-md transition-all">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-carolina/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <ClipboardList className="w-6 h-6 md:w-7 md:h-7 text-carolina" />
            </div>
            <h4 className="text-base md:text-lg font-bold mb-2">Competitive Play</h4>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Travel teams competing at regional and state levels
            </p>
          </div>
        </div>
      </div>
      <ScrollIndicator />
    </section>
  );
};

export default RegistrationSection;
