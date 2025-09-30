import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import slidingAction from "@/assets/sliding-action.jpg";
import { Sparkles, DollarSign, GraduationCap, Users } from "lucide-react";

const UmpiresSection = () => {
  return (
    <section id="umpires" className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Youth Umpire Program
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join the Junior Blues and become part of the game
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
          <div className="order-2 md:order-1">
            <Card className="border-primary/20">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Calling All Future Umpires!</h3>
                <p className="text-lg mb-6 leading-relaxed">
                  The Fox Valley Blues Umpires Association's Junior Blues (JVB) youth umpire program is recruiting dedicated boys and girls ages 13–18 who love baseball and softball.
                </p>
                <p className="text-base text-muted-foreground mb-6">
                  We are looking for dedicated young men AND women between the ages of 13-18 who love the games of Baseball and Softball and want to earn money, stay involved in the game, and develop valuable life skills.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">Earn Money</div>
                      <div className="text-sm text-muted-foreground">Get paid per game</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">Learn Skills</div>
                      <div className="text-sm text-muted-foreground">Training provided</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">Stay Active</div>
                      <div className="text-sm text-muted-foreground">Be part of the game</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">Build Character</div>
                      <div className="text-sm text-muted-foreground">Leadership & teamwork</div>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2121019', '_blank')}
                >
                  Sign Up to Learn More
                </Button>
              </CardContent>
            </Card>
          </div>
          <div className="order-1 md:order-2">
            <img 
              src={slidingAction} 
              alt="Baseball action - sliding into base" 
              className="rounded-lg shadow-[var(--shadow-card)] w-full h-auto"
            />
          </div>
        </div>

        <div className="text-center bg-primary/5 rounded-lg p-8 border border-primary/10">
          <p className="text-lg font-medium mb-2">
            Ages 13-18 • Baseball & Softball • Fox Valley Blues Association
          </p>
          <p className="text-muted-foreground">
            Open to all dedicated young people who want to give back to the game they love
          </p>
        </div>
      </div>
    </section>
  );
};

export default UmpiresSection;
