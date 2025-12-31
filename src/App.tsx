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
import Shop from "./pages/Shop";
import About from "./pages/About";
import Rules from "./pages/Rules";
import Volunteer from "./pages/Volunteer";
import Sponsors from "./pages/Sponsors";
import Contact from "./pages/Contact";
import Donate from "./pages/Donate";
import NewToCDBL from "./pages/NewToCDBL";
import BoardInfo from "./pages/BoardInfo";
import InHouse from "./pages/InHouse";
import Travel from "./pages/Travel";
import InHouseTeams from "./pages/InHouseTeams";
import InHouseRegistration from "./pages/InHouseRegistration";
import InHouseSchedule from "./pages/InHouseSchedule";
import InHouseRules from "./pages/InHouseRules";
import TravelTeams from "./pages/TravelTeams";

import TravelSchedule from "./pages/TravelSchedule";
import TravelFAQ from "./pages/TravelFAQ";
import NotFound from "./pages/NotFound";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Players from "./pages/admin/Players";
import PlayerEdit from "./pages/admin/PlayerEdit";
import AdminTeams from "./pages/admin/Teams";
import TeamEdit from "./pages/admin/TeamEdit";
import Coaches from "./pages/admin/Coaches";
import CoachEdit from "./pages/admin/CoachEdit";
import AdminSchedule from "./pages/admin/Schedule";
import Venues from "./pages/admin/Venues";
import VenueEdit from "./pages/admin/VenueEdit";
import AdminReports from "./pages/admin/Reports";
import GameChangerSync from "./pages/admin/GameChangerSync";
import Programs from "./pages/admin/Programs";
import Divisions from "./pages/admin/Divisions";
import FAQs from "./pages/admin/FAQs";
import Support from "./pages/admin/Support";
import ProgramEdit from "./pages/admin/ProgramEdit";
import DivisionEdit from "./pages/admin/DivisionEdit";
import FAQEdit from "./pages/admin/FAQEdit";
import SupportEdit from "./pages/admin/SupportEdit";
import SiteContent from "./pages/admin/SiteContent";
import SiteContentEdit from "./pages/admin/SiteContentEdit";
import Drafts from "./pages/admin/Drafts";
import DraftEdit from "./pages/admin/DraftEdit";
import DraftLive from "./pages/admin/DraftLive";
import Commissioner from "./pages/admin/Commissioner";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ChatAssistant } from "./components/ChatAssistant";
import { CoachLayout } from "./components/CoachLayout";
import CoachDashboard from "./pages/coach/Dashboard";
import CoachDraftRoom from "./pages/coach/DraftRoom";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <ChatAssistant />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/fields" element={<Fields />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/about" element={<About />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/donate" element={<Donate />} />
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
          
          <Route path="/travel/schedule" element={<TravelSchedule />} />
          <Route path="/travel/faq" element={<TravelFAQ />} />
          {/* Admin Routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<ProtectedRoute requireAdmin><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/players" element={<ProtectedRoute requireAdmin><Players /></ProtectedRoute>} />
            <Route path="/admin/players/new" element={<ProtectedRoute requireAdmin><PlayerEdit /></ProtectedRoute>} />
            <Route path="/admin/players/:id" element={<ProtectedRoute requireAdmin><PlayerEdit /></ProtectedRoute>} />
            <Route path="/admin/teams" element={<ProtectedRoute requireAdmin><AdminTeams /></ProtectedRoute>} />
            <Route path="/admin/teams/new" element={<ProtectedRoute requireAdmin><TeamEdit /></ProtectedRoute>} />
            <Route path="/admin/teams/:id" element={<ProtectedRoute requireAdmin><TeamEdit /></ProtectedRoute>} />
            <Route path="/admin/coaches" element={<ProtectedRoute requireAdmin><Coaches /></ProtectedRoute>} />
            <Route path="/admin/coaches/new" element={<ProtectedRoute requireAdmin><CoachEdit /></ProtectedRoute>} />
            <Route path="/admin/coaches/:id" element={<ProtectedRoute requireAdmin><CoachEdit /></ProtectedRoute>} />
            <Route path="/admin/schedule" element={<ProtectedRoute requireAdmin><AdminSchedule /></ProtectedRoute>} />
            <Route path="/admin/venues" element={<ProtectedRoute requireAdmin><Venues /></ProtectedRoute>} />
            <Route path="/admin/venues/new" element={<ProtectedRoute requireAdmin><VenueEdit /></ProtectedRoute>} />
            <Route path="/admin/venues/:id" element={<ProtectedRoute requireAdmin><VenueEdit /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute requireAdmin><AdminReports /></ProtectedRoute>} />
            <Route path="/admin/gamechanger" element={<ProtectedRoute requireAdmin><GameChangerSync /></ProtectedRoute>} />
            <Route path="/admin/programs" element={<ProtectedRoute requireAdmin><Programs /></ProtectedRoute>} />
          <Route path="/admin/programs/new" element={<ProtectedRoute requireAdmin><ProgramEdit /></ProtectedRoute>} />
          <Route path="/admin/programs/:id" element={<ProtectedRoute requireAdmin><ProgramEdit /></ProtectedRoute>} />
          <Route path="/admin/divisions" element={<ProtectedRoute requireAdmin><Divisions /></ProtectedRoute>} />
          <Route path="/admin/divisions/new" element={<ProtectedRoute requireAdmin><DivisionEdit /></ProtectedRoute>} />
          <Route path="/admin/divisions/:id" element={<ProtectedRoute requireAdmin><DivisionEdit /></ProtectedRoute>} />
          <Route path="/admin/faqs" element={<ProtectedRoute requireAdmin><FAQs /></ProtectedRoute>} />
          <Route path="/admin/faqs/new" element={<ProtectedRoute requireAdmin><FAQEdit /></ProtectedRoute>} />
          <Route path="/admin/faqs/:id" element={<ProtectedRoute requireAdmin><FAQEdit /></ProtectedRoute>} />
          <Route path="/admin/support" element={<ProtectedRoute requireAdmin><Support /></ProtectedRoute>} />
          <Route path="/admin/support/new" element={<ProtectedRoute requireAdmin><SupportEdit /></ProtectedRoute>} />
          <Route path="/admin/support/:id" element={<ProtectedRoute requireAdmin><SupportEdit /></ProtectedRoute>} />
          <Route path="/admin/site-content" element={<ProtectedRoute requireAdmin><SiteContent /></ProtectedRoute>} />
          <Route path="/admin/site-content/new" element={<ProtectedRoute requireAdmin><SiteContentEdit /></ProtectedRoute>} />
          <Route path="/admin/site-content/:id" element={<ProtectedRoute requireAdmin><SiteContentEdit /></ProtectedRoute>} />
          <Route path="/admin/drafts" element={<ProtectedRoute requireAdmin><Drafts /></ProtectedRoute>} />
          <Route path="/admin/drafts/new" element={<ProtectedRoute requireAdmin><DraftEdit /></ProtectedRoute>} />
          <Route path="/admin/drafts/:id" element={<ProtectedRoute requireAdmin><DraftEdit /></ProtectedRoute>} />
          <Route path="/admin/drafts/:id/live" element={<ProtectedRoute requireAdmin><DraftLive /></ProtectedRoute>} />
          <Route path="/admin/commissioner" element={<ProtectedRoute requireAdmin><Commissioner /></ProtectedRoute>} />
          {/* Coach Routes */}
          <Route path="/coach" element={<ProtectedRoute requireCoach><CoachLayout /></ProtectedRoute>}>
            <Route index element={<CoachDashboard />} />
            <Route path="drafts/:id" element={<CoachDraftRoom />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
