import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarGrid } from "@/components/CalendarGrid";
import { EventDetailModal } from "@/components/EventDetailModal";
import { FeaturedEventsCarousel } from "@/components/FeaturedEventsCarousel";
import { calendarEvents, CalendarEvent } from "@/data/calendarEvents";
import { Calendar, Trophy, Users, Heart, HandHeart, DollarSign, Facebook, Twitter, Instagram } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import heroImage from "@/assets/hero-events.jpg";

const Events = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const filteredEvents = useMemo(() => {
    if (activeTab === "all") return calendarEvents;
    return calendarEvents.filter(event => event.category === activeTab);
  }, [activeTab]);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const scrollToCalendar = () => {
    document.getElementById('calendar-section')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section 
          className="relative py-16 md:py-24 text-primary-foreground overflow-hidden bg-cover bg-center sm:bg-center md:bg-[65%_center]"
          style={{
            backgroundImage: `linear-gradient(to right, hsla(217, 100%, 32%, 0.9) 0%, hsla(201, 63%, 56%, 0.1) 100%), url(${heroImage})`,
          }}
        >
          <div className="container relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 md:mb-6 leading-tight">
                CDBL Calendar
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 leading-relaxed opacity-95">
                Stay up to date on upcoming events, practices, and games across the Central District Baseball League.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Button 
                  variant="default" 
                  size="lg"
                  onClick={scrollToCalendar}
                  className="bg-white text-primary hover:bg-white/90 shadow-lg font-heading font-semibold"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  View Full Calendar
                </Button>
              <Button 
                variant="outline" 
                size="lg"
                asChild
                className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-carolina hover:border-white font-heading font-semibold"
              >
                <Link to="/schedule">View Team Calendar</Link>
              </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Events Carousel */}
        <FeaturedEventsCarousel 
          events={calendarEvents}
          onEventClick={handleEventClick}
        />

        {/* Calendar Section */}
        <section id="calendar-section" className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-8 md:mb-12 h-auto">
                <TabsTrigger value="all" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-2 md:py-3">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs md:text-sm">All</span>
                </TabsTrigger>
                <TabsTrigger value="event" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-2 md:py-3">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs md:text-sm">Events</span>
                </TabsTrigger>
                <TabsTrigger value="practice" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-2 md:py-3">
                  <Users className="h-4 w-4" />
                  <span className="text-xs md:text-sm">Practices</span>
                </TabsTrigger>
                <TabsTrigger value="game" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-2 md:py-3">
                  <Trophy className="h-4 w-4" />
                  <span className="text-xs md:text-sm">Games</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                <CalendarGrid 
                  events={filteredEvents}
                  onEventClick={handleEventClick}
                />
              </TabsContent>
            </Tabs>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-12 md:mt-16 max-w-4xl mx-auto">
              <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="inline-flex p-3 rounded-full bg-event-gold/10 mb-3 animate-pulse">
                    <Calendar className="h-8 w-8 text-event-gold" />
                  </div>
                  <p className="text-3xl md:text-4xl font-heading font-bold mb-1">
                    {calendarEvents.filter(e => e.category === 'event').length}
                  </p>
                  <p className="text-sm md:text-base text-muted-foreground font-sans">Total League Events</p>
                </CardContent>
              </Card>
              <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="inline-flex p-3 rounded-full bg-event-practice/10 mb-3 animate-pulse" style={{ animationDelay: '0.2s' }}>
                    <Users className="h-8 w-8 text-event-practice" />
                  </div>
                  <p className="text-3xl md:text-4xl font-heading font-bold mb-1">
                    {calendarEvents.filter(e => e.category === 'practice').length}
                  </p>
                  <p className="text-sm md:text-base text-muted-foreground font-sans">Practice Sessions</p>
                </CardContent>
              </Card>
              <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="inline-flex p-3 rounded-full bg-event-game/10 mb-3 animate-pulse" style={{ animationDelay: '0.4s' }}>
                    <Trophy className="h-8 w-8 text-event-game" />
                  </div>
                  <p className="text-3xl md:text-4xl font-heading font-bold mb-1">
                    {calendarEvents.filter(e => e.category === 'game').length}
                  </p>
                  <p className="text-sm md:text-base text-muted-foreground font-sans">Game Days</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Stay in the Loop Section */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Stay in the Loop</h2>
              <p className="text-base md:text-lg text-muted-foreground font-sans max-w-2xl mx-auto">
                Follow us on social media for real-time updates, weather alerts, and schedule changes.
              </p>
            </div>
            
            {/* Social Media Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                    <Facebook className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold mb-2">Facebook</h3>
                  <p className="text-sm text-muted-foreground mb-4">Daily updates & photos</p>
                  <Button variant="outline" size="sm" asChild className="w-full font-heading">
                    <a href="https://facebook.com/cdbl" target="_blank" rel="noopener noreferrer">
                      Follow
                    </a>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                    <Twitter className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold mb-2">Twitter</h3>
                  <p className="text-sm text-muted-foreground mb-4">Live game scores</p>
                  <Button variant="outline" size="sm" asChild className="w-full font-heading">
                    <a href="https://twitter.com/cdbl" target="_blank" rel="noopener noreferrer">
                      Follow
                    </a>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                    <Instagram className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold mb-2">Instagram</h3>
                  <p className="text-sm text-muted-foreground mb-4">Behind the scenes</p>
                  <Button variant="outline" size="sm" asChild className="w-full font-heading">
                    <a href="https://instagram.com/cdbl" target="_blank" rel="noopener noreferrer">
                      Follow
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Get Involved CTA Section */}
        <section className="py-16 md:py-20 bg-gradient-to-br from-primary to-primary-light text-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10 md:mb-12">
              <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">Get Involved with CDBL</h2>
              <p className="text-base md:text-xl max-w-2xl mx-auto opacity-95 font-sans leading-relaxed">
                Join our community and help make a difference in youth baseball. Every contribution matters.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 md:p-8 text-center">
                  <div className="inline-flex p-4 rounded-full bg-white/20 mb-4">
                    <HandHeart className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold mb-3 text-white">Volunteer</h3>
                  <p className="text-white/90 mb-6 font-sans">
                    Coach, umpire, or help with events. Make an impact on young athletes.
                  </p>
                  <Button 
                    size="lg" 
                    className="w-full bg-white text-primary hover:bg-white/90 font-heading font-semibold"
                    asChild
                  >
                    <a href="/volunteer">Get Started</a>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 md:p-8 text-center">
                  <div className="inline-flex p-4 rounded-full bg-white/20 mb-4">
                    <Heart className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold mb-3 text-white">Donate</h3>
                  <p className="text-white/90 mb-6 font-sans">
                    Support equipment, field maintenance, and scholarships for families.
                  </p>
                  <Button 
                    size="lg" 
                    className="w-full bg-white text-primary hover:bg-white/90 font-heading font-semibold"
                    asChild
                  >
                    <a href="/donate">Donate Now</a>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 md:p-8 text-center">
                  <div className="inline-flex p-4 rounded-full bg-white/20 mb-4">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold mb-3 text-white">Register</h3>
                  <p className="text-white/90 mb-6 font-sans">
                    Sign up your player for the 2026 season. In-House or Travel teams.
                  </p>
                  <Button 
                    size="lg" 
                    className="w-full bg-white text-primary hover:bg-white/90 font-heading font-semibold"
                    asChild
                  >
                    <a href="/registration">Register Now</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Event Detail Modal */}
      <EventDetailModal 
        event={selectedEvent}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default Events;