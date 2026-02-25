import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import youthUmpire from "@/assets/youth-umpire.png";
import { Sparkles, DollarSign, GraduationCap, Users, FileText, ExternalLink } from "lucide-react";
const UmpiresSection = () => {
  return <section id="umpires" className="py-12 md:py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
            Youth Umpire Program
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            Join the Junior Blues and become part of the game
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-6 md:gap-8 items-center mb-8 md:mb-12">
          <div className="order-2 md:order-1 md:col-span-3 bg-white p-6 md:p-8 rounded-xl shadow-[var(--shadow-card)] border border-primary/20">
            <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Calling All Future Umpires!</h3>
            <p className="text-base md:text-lg mb-4 md:mb-6 leading-relaxed">
              The Fox Valley Blues Umpires Association's Junior Blues (JVB) youth umpire program is recruiting dedicated boys and girls ages 13–18 who love baseball and softball.
            </p>
            <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8">
              We are looking for dedicated young men AND women between the ages of 13-18 who love the games of Baseball and Softball and want to earn money, stay involved in the game, and develop valuable life skills.
            </p>

            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="flex items-start gap-2 md:gap-3">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-carolina/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-carolina" />
                </div>
                <div>
                  <div className="text-sm md:text-base font-semibold">Earn Money</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Get paid per game</div>
                </div>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm md:text-base font-semibold">Learn Skills</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Training provided</div>
                </div>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-carolina/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-carolina" />
                </div>
                <div>
                  <div className="text-sm md:text-base font-semibold">Stay Active</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Be part of the game</div>
                </div>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm md:text-base font-semibold">Build Character</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Leadership & teamwork</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button variant="hero" size="lg" className="w-full" onClick={() => window.open('https://forms.gle/JYC4DrjqxtTqSRF1A', '_blank')}>
                Sign Up Now
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="lg" className="w-full" onClick={() => window.open('https://cdn3.sportngin.com/attachments/document/4dfb-2881317/JVB_Flyer_-_Generic_2026.pdf?_gl=1*1dmueco*_ga*MjkwNjQ3ODgxLjE3NzE5ODUwMTE.#_ga=2.33686177.1627488704.1771985011-290647881.1771985011', '_blank')}>
                  <FileText className="w-4 h-4 mr-1" />
                  Download Flyer
                </Button>
                <Button variant="outline" size="lg" className="w-full" onClick={() => window.open('https://www.fvbumpire.com/jvblues/', '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Visit FVB Website
                </Button>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2 md:col-span-2">
            <img src={youthUmpire} alt="Youth umpire making a call during a Rockets baseball game" className="rounded-xl shadow-[var(--shadow-elevated)] w-full h-auto" />
          </div>
        </div>

        
      </div>
    </section>;
};
export default UmpiresSection;