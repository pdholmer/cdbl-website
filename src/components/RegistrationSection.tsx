import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Calendar, ClipboardList, Users, Trophy, Heart, MapPin } from "lucide-react";
import playerPitching from "@/assets/rockets-pitcher.png";
import inhouseAction from "@/assets/inhouse-action.png";
import { usePrograms } from "@/hooks/usePrograms";

const RegistrationSection = () => {
  const { inHouseProgram, travelProgram } = usePrograms();

  return (
    <section id="registration" className="py-12 md:py-20 relative overflow-hidden"
             style={{ background: 'var(--gradient-subtle)' }}>
      <div className="container">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
            Find Your Program
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            Whether you're new to baseball or ready for competitive play, CDBL has the right program for your child
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
          {/* In-House Program Card - Primary focus */}
          <Card className="overflow-hidden border-2 border-primary shadow-lg hover:shadow-xl transition-all">
            <div className="relative h-48 md:h-56">
              <img 
                src={inhouseAction} 
                alt="Youth player sliding into base" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                    MOST POPULAR
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white">In-House Baseball</h3>
              </div>
            </div>
            <CardContent className="p-5 md:p-6">
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Our recreational league welcomes players of all skill levels. No tryouts required — just fun, skill-building, and making friends while learning the game.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="flex items-start gap-2">
                  <Heart className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">All skill levels welcome</span>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">1-2 games per week</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Local games only</span>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Ages 4-14</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="flex-1"
                  asChild
                >
                  <Link to="/in-house">
                    Learn More
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Travel Program Card - Secondary */}
          <Card className="overflow-hidden border-2 border-border hover:border-carolina transition-all">
            <div className="relative h-48 md:h-56">
              <img 
                src={playerPitching} 
                alt="Youth player pitching" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-carolina text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                    COMPETITIVE
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white">Rockets Travel</h3>
              </div>
            </div>
            <CardContent className="p-5 md:p-6">
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Our elite travel program for experienced players looking to compete at the next level. 
                Tryouts required. Pipeline to Burlington Central High School baseball.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="flex items-start gap-2">
                  <Trophy className="w-4 h-4 text-carolina mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Tryouts required</span>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-carolina mt-0.5 flex-shrink-0" />
                  <span className="text-sm">5-8 tournaments/season</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-carolina mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Regional & state travel</span>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-carolina mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Ages 8-14</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="flex-1"
                  asChild
                >
                  <Link to="/travel#tryouts">
                    View Tryout Info
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="flex-1"
                  asChild
                >
                  <Link to="/travel">
                    Learn More
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cross-link to schedule */}
        <div className="text-center mb-8 md:mb-12">
          <Button variant="outline" size="lg" asChild>
            <Link to="/schedule" className="gap-2">
              <Calendar className="h-5 w-5" />
              See Upcoming Games →
            </Link>
          </Button>
        </div>

        {/* Value Props — asymmetric */}
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
          {/* Lead item — left, larger */}
          <div>
            <Calendar className="w-10 h-10 md:w-12 md:h-12 text-carolina mb-4" aria-hidden="true" />
            <h4 className="font-heading text-3xl md:text-4xl font-bold mb-3 leading-tight">
              Flexible scheduling
            </h4>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-md">
              Games and practices scheduled around family commitments — because baseball should fit your life, not the other way around.
            </p>
          </div>

          {/* Stacked smaller items — right */}
          <div className="space-y-8 md:pt-4">
            <div>
              <Users className="w-7 h-7 text-primary mb-2" aria-hidden="true" />
              <h4 className="font-heading text-xl md:text-2xl font-bold mb-1">Expert coaching</h4>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Experienced coaches dedicated to player development.
              </p>
            </div>
            <div>
              <ClipboardList className="w-7 h-7 text-carolina mb-2" aria-hidden="true" />
              <h4 className="font-heading text-xl md:text-2xl font-bold mb-1">Community first</h4>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                A welcoming community of players and families.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegistrationSection;
