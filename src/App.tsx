import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Registration from "./pages/Registration";
import Teams from "./pages/Teams";
import Schedule from "./pages/Schedule";
import Fields from "./pages/Fields";
import Events from "./pages/Events";
import Shop from "./pages/Shop";
import About from "./pages/About";
import Rules from "./pages/Rules";
import Volunteer from "./pages/Volunteer";
import Sponsors from "./pages/Sponsors";
import Contact from "./pages/Contact";
import NewToCDBL from "./pages/NewToCDBL";
import BoardInfo from "./pages/BoardInfo";
import InHouse from "./pages/InHouse";
import Travel from "./pages/Travel";
import InHouseTeams from "./pages/InHouseTeams";
import InHouseRegistration from "./pages/InHouseRegistration";
import InHouseSchedule from "./pages/InHouseSchedule";
import InHouseRules from "./pages/InHouseRules";
import TravelTeams from "./pages/TravelTeams";
import TravelRegistration from "./pages/TravelRegistration";
import TravelSchedule from "./pages/TravelSchedule";
import TravelFAQ from "./pages/TravelFAQ";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/fields" element={<Fields />} />
          <Route path="/events" element={<Events />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/about" element={<About />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/sponsors" element={<Sponsors />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/new-to-cdbl" element={<NewToCDBL />} />
          <Route path="/board" element={<BoardInfo />} />
          <Route path="/in-house" element={<InHouse />} />
          <Route path="/in-house/teams" element={<InHouseTeams />} />
          <Route path="/in-house/registration" element={<InHouseRegistration />} />
          <Route path="/in-house/schedule" element={<InHouseSchedule />} />
          <Route path="/in-house/rules" element={<InHouseRules />} />
          <Route path="/travel" element={<Travel />} />
          <Route path="/travel/teams" element={<TravelTeams />} />
          <Route path="/travel/registration" element={<TravelRegistration />} />
          <Route path="/travel/schedule" element={<TravelSchedule />} />
          <Route path="/travel/faq" element={<TravelFAQ />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
