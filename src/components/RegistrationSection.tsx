import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import playerPitching from "@/assets/player-pitching.jpg";
import { Calendar, ClipboardList, Users } from "lucide-react";

const RegistrationSection = () => {
  return (
    <section id="registration" className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Travel Player Registration
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join the Rockets and take your baseball skills to the next level
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
          <div>
            <img 
              src={playerPitching} 
              alt="Youth player pitching" 
              className="rounded-lg shadow-[var(--shadow-card)] w-full h-auto"
            />
          </div>
          <div>
            <Card className="border-primary/20">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">2026 Travel & Part-Time Tryouts</h3>
                <p className="text-lg mb-6 leading-relaxed">
                  Please register here for the 2026 Travel and Part-Time Tryouts. Players are required to register to be considered for a Travel or Part-Time Travel position – even if unable to make the tryout.
                </p>
                <p className="text-muted-foreground mb-8">
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
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-bold mb-2">Flexible Scheduling</h4>
              <p className="text-sm text-muted-foreground">
                Games and practices scheduled around family commitments
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-bold mb-2">Expert Coaching</h4>
              <p className="text-sm text-muted-foreground">
                Experienced coaches dedicated to player development
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-bold mb-2">Competitive Play</h4>
              <p className="text-sm text-muted-foreground">
                Travel teams competing at regional and state levels
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default RegistrationSection;
