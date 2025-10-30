import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UpcomingMatchCard } from "@/components/UpcomingMatchCard";
import { DivisionScheduleTable } from "@/components/DivisionScheduleTable";
import { EventDetailModal } from "@/components/EventDetailModal";
import { calendarEvents, CalendarEvent } from "@/data/calendarEvents";
import { Calendar, MapPin, Users, HandHeart, ExternalLink, Filter } from "lucide-react";
import { isAfter, parseISO, startOfToday } from "date-fns";
import heroImage from "@/assets/hero-schedule.jpg";

const Schedule = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Get upcoming events (future events only)
  const upcomingEvents = useMemo(() => {
    const today = startOfToday();
    return calendarEvents
      .filter(event => {
        const eventDate = parseISO(event.date);
        return isAfter(eventDate, today) || eventDate.toDateString() === today.toDateString();
      })
      .sort((a, b) => {
        const dateA = parseISO(a.date);
        const dateB = parseISO(b.date);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 6);
  }, []);

  // Filter events by division/category
  const filteredEvents = useMemo(() => {
    if (activeTab === "all") return calendarEvents;
    
    // Filter by category
    return calendarEvents.filter(event => {
      if (activeTab === "practices") return event.category === "practice";
      if (activeTab === "games") return event.category === "game";
      if (activeTab === "events") return event.category === "event";
      return true;
    });
  }, [activeTab]);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const scrollToSchedule = () => {
    document.getElementById('schedule-section')?.scrollIntoView({ 
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
                League Schedule
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 leading-relaxed opacity-95 font-sans">
                View practices, games, and upcoming matchups across all CDBL divisions.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <Button 
                  variant="default" 
                  size="lg"
                  onClick={scrollToSchedule}
                  className="bg-white text-primary hover:bg-white/90 shadow-lg font-heading font-semibold"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Filter</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  asChild
                  className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-carolina hover:border-white font-heading font-semibold"
                >
                  <Link to="/events">Full Calendar</Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  asChild
                  className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-carolina hover:border-white font-heading font-semibold col-span-2 md:col-span-1"
                >
                  <Link to="/fields">View Fields</Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2121019', '_blank')}
                  className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-carolina hover:border-white font-heading font-semibold col-span-2 md:col-span-1"
                >
                  SportsConnect
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Matches Section */}
        <section className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-8 text-center">Upcoming Events</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <UpcomingMatchCard
                  key={event.id}
                  event={event}
                  onViewDetails={handleEventClick}
                />
              ))}
            </div>

            {upcomingEvents.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground text-lg">No upcoming events scheduled at this time.</p>
              </Card>
            )}
          </div>
        </section>

        {/* Division Schedule Tabs */}
        <section id="schedule-section" className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-8 text-center">Schedule by Type</h2>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-8 md:mb-12 h-auto">
                <TabsTrigger value="all" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-2 md:py-3">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs md:text-sm">All</span>
                </TabsTrigger>
                <TabsTrigger value="games" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-2 md:py-3">
                  <Users className="h-4 w-4" />
                  <span className="text-xs md:text-sm">Games</span>
                </TabsTrigger>
                <TabsTrigger value="practices" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-2 md:py-3">
                  <Users className="h-4 w-4" />
                  <span className="text-xs md:text-sm">Practices</span>
                </TabsTrigger>
                <TabsTrigger value="events" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-2 md:py-3">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs md:text-sm">Events</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                <DivisionScheduleTable 
                  events={filteredEvents}
                  onEventClick={handleEventClick}
                />
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Important Dates Section */}
        <section className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-8 md:mb-12 text-center">Important Dates - 2026 Season</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
              {[
                { date: "Dec 1, 2025", title: "Registration Opens", desc: "Early bird registration begins" },
                { date: "Mar 8-9, 2026", title: "Player Evaluations", desc: "Skill assessments for team placement" },
                { date: "Mar 15, 2026", title: "Draft Day", desc: "Team rosters finalized" },
                { date: "Apr 12, 2026", title: "Opening Day", desc: "Season kicks off with ceremony" },
                { date: "Jun 20, 2026", title: "All-Star Game", desc: "Annual all-star showcase" },
                { date: "Jul 18, 2026", title: "Championship Day", desc: "Season finale tournaments" }
              ].map((item, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
                      <Calendar className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-xl md:text-2xl font-heading font-bold text-primary mb-2">{item.date}</p>
                    <h3 className="font-heading font-semibold text-lg mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground font-sans">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Footer CTA Section */}
        <section className="py-16 md:py-20 bg-gradient-to-br from-primary to-primary-light text-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10 md:mb-12">
              <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">Access Your Team Schedule</h2>
              <p className="text-base md:text-xl max-w-2xl mx-auto opacity-95 font-sans leading-relaxed">
                View complete schedules, game results, and standings on SportsConnect once the season begins.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 md:p-8 text-center">
                  <div className="inline-flex p-4 rounded-full bg-white/20 mb-4">
                    <ExternalLink className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold mb-3 text-white">SportsConnect</h3>
                  <p className="text-white/90 mb-6 font-sans">
                    Access team schedules, standings, and game results in real-time.
                  </p>
                  <Button 
                    size="lg" 
                    className="w-full bg-white text-primary hover:bg-white/90 font-heading font-semibold"
                    onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2121019', '_blank')}
                  >
                    Open SportsConnect
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 md:p-8 text-center">
                  <div className="inline-flex p-4 rounded-full bg-white/20 mb-4">
                    <MapPin className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold mb-3 text-white">Fields & Maps</h3>
                  <p className="text-white/90 mb-6 font-sans">
                    Find field locations, directions, and parking information.
                  </p>
                  <Button 
                    size="lg" 
                    className="w-full bg-white text-primary hover:bg-white/90 font-heading font-semibold"
                    asChild
                  >
                    <Link to="/fields">View All Fields</Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 md:p-8 text-center">
                  <div className="inline-flex p-4 rounded-full bg-white/20 mb-4">
                    <HandHeart className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold mb-3 text-white">Volunteer</h3>
                  <p className="text-white/90 mb-6 font-sans">
                    Help make game day special by volunteering for various roles.
                  </p>
                  <Button 
                    size="lg" 
                    className="w-full bg-white text-primary hover:bg-white/90 font-heading font-semibold"
                    asChild
                  >
                    <Link to="/volunteer">Get Involved</Link>
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

export default Schedule;
