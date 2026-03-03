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
                  {inHouseProgram?.registration_open && (
                    <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                      OPEN NOW
                    </span>
                  )}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white">In-House Baseball</h3>
              </div>
            </div>
            <CardContent className="p-5 md:p-6">
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Our recreational league is perfect for players of all skill levels. No tryouts required—just fun, 
                skill-building, and making friends while learning America's favorite pastime.
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
                  <Link to="/registration">
                    Register for In-House
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
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

        {/* Value Props */}
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
            <h4 className="text-base md:text-lg font-bold mb-2">Community First</h4>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              A welcoming community of players and families
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegistrationSection;
