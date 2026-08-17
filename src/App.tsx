import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import { PageGate } from "./components/PageGate";
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
import { Navigate } from "react-router-dom";
import InHouseSchedule from "./pages/InHouseSchedule";
import InHouseRules from "./pages/InHouseRules";

import TravelFAQ from "./pages/TravelFAQ";
import TravelRegistration from "./pages/TravelRegistration";
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
import Feedback from "./pages/admin/Feedback";
import Users from "./pages/admin/Users";
import RegistrationCodes from "./pages/admin/RegistrationCodes";
import RegistrationCodeEdit from "./pages/admin/RegistrationCodeEdit";
import CommitteeTasks from "./pages/admin/CommitteeTasks";
import Concessions from "./pages/admin/Concessions";
import Communication from "./pages/admin/Communication";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ChatAssistant } from "./components/ChatAssistant";
import { CoachLayout } from "./components/CoachLayout";
import CoachDashboard from "./pages/coach/Dashboard";
import CoachDraftRoom from "./pages/coach/DraftRoom";
import { FeedbackProvider } from "./contexts/FeedbackContext";
import { FeedbackFAB, FeedbackSlider } from "./components/feedback";
import OAuthConsent from "./pages/OAuthConsent";
import GuardianLogin from "./pages/Login";
import Household from "./pages/Household";
import HouseholdNew from "./pages/HouseholdNew";
import EmailBounces from "./pages/admin/EmailBounces";
import Training from "./pages/Training";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <FeedbackProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <ChatAssistant />
          <FeedbackFAB />
          <FeedbackSlider />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
          <Route path="/registration" element={<PageGate slug="registration"><Registration /></PageGate>} />
          <Route path="/teams" element={<PageGate slug="teams"><Teams /></PageGate>} />
          <Route path="/schedule" element={<PageGate slug="schedule"><Schedule /></PageGate>} />
          <Route path="/fields" element={<PageGate slug="fields"><Fields /></PageGate>} />
          <Route path="/shop" element={<PageGate slug="shop"><Shop /></PageGate>} />
          <Route path="/about" element={<PageGate slug="about"><About /></PageGate>} />
          <Route path="/rules" element={<PageGate slug="rules"><Rules /></PageGate>} />
          <Route path="/volunteer" element={<PageGate slug="volunteer"><Volunteer /></PageGate>} />
          <Route path="/donate" element={<PageGate slug="donate"><Donate /></PageGate>} />
          <Route path="/sponsors" element={<PageGate slug="sponsors"><Sponsors /></PageGate>} />
          <Route path="/contact" element={<PageGate slug="contact"><Contact /></PageGate>} />
          <Route path="/new-to-cdbl" element={<PageGate slug="new-to-cdbl"><NewToCDBL /></PageGate>} />
          <Route path="/board" element={<PageGate slug="board"><BoardInfo /></PageGate>} />
          <Route path="/in-house" element={<PageGate slug="in-house"><InHouse /></PageGate>} />
          <Route path="/in-house/teams" element={<PageGate slug="in-house-teams"><InHouseTeams /></PageGate>} />
          <Route path="/in-house/registration" element={<Navigate to="/registration" replace />} />
          <Route path="/in-house/schedule" element={<PageGate slug="in-house-schedule"><InHouseSchedule /></PageGate>} />
          <Route path="/in-house/rules" element={<PageGate slug="in-house-rules"><InHouseRules /></PageGate>} />
          <Route path="/travel" element={<PageGate slug="travel"><Travel /></PageGate>} />
          <Route path="/travel/schedule" element={<Navigate to="/schedule" replace />} />
          <Route path="/travel/faq" element={<PageGate slug="travel-faq"><TravelFAQ /></PageGate>} />
          <Route path="/travel/registration" element={<PageGate slug="travel-registration"><TravelRegistration /></PageGate>} />
          {/* Unified auth */}
          <Route path="/login" element={<GuardianLogin />} />
          <Route path="/training" element={<Training />} />
          <Route path="/household" element={<Household />} />
          <Route path="/household/new" element={<HouseholdNew />} />
          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/email-bounces" element={<ProtectedRoute requireBoardMember><EmailBounces /></ProtectedRoute>} />
          
          {/* Board Member Routes - accessible by admin OR board_member */}
          <Route path="/admin" element={<ProtectedRoute requireBoardMember><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/players" element={<ProtectedRoute requireBoardMember><Players /></ProtectedRoute>} />
          <Route path="/admin/players/new" element={<ProtectedRoute requireBoardMember><PlayerEdit /></ProtectedRoute>} />
          <Route path="/admin/players/:id" element={<ProtectedRoute requireBoardMember><PlayerEdit /></ProtectedRoute>} />
          <Route path="/admin/teams" element={<ProtectedRoute requireBoardMember><AdminTeams /></ProtectedRoute>} />
          <Route path="/admin/teams/new" element={<ProtectedRoute requireBoardMember><TeamEdit /></ProtectedRoute>} />
          <Route path="/admin/teams/:id" element={<ProtectedRoute requireBoardMember><TeamEdit /></ProtectedRoute>} />
          <Route path="/admin/coaches" element={<ProtectedRoute requireBoardMember><Coaches /></ProtectedRoute>} />
          <Route path="/admin/coaches/new" element={<ProtectedRoute requireBoardMember><CoachEdit /></ProtectedRoute>} />
          <Route path="/admin/coaches/:id" element={<ProtectedRoute requireBoardMember><CoachEdit /></ProtectedRoute>} />
          <Route path="/admin/schedule" element={<ProtectedRoute requireBoardMember><AdminSchedule /></ProtectedRoute>} />
          <Route path="/admin/facilities" element={<ProtectedRoute requireBoardMember><Venues /></ProtectedRoute>} />
          <Route path="/admin/facilities/new" element={<ProtectedRoute requireBoardMember><VenueEdit /></ProtectedRoute>} />
          <Route path="/admin/facilities/:id" element={<ProtectedRoute requireBoardMember><VenueEdit /></ProtectedRoute>} />
          <Route path="/admin/faqs" element={<ProtectedRoute requireBoardMember><FAQs /></ProtectedRoute>} />
          <Route path="/admin/faqs/new" element={<ProtectedRoute requireBoardMember><FAQEdit /></ProtectedRoute>} />
          <Route path="/admin/faqs/:id" element={<ProtectedRoute requireBoardMember><FAQEdit /></ProtectedRoute>} />
          <Route path="/admin/support" element={<ProtectedRoute requireBoardMember><Support /></ProtectedRoute>} />
          <Route path="/admin/support/new" element={<ProtectedRoute requireBoardMember><SupportEdit /></ProtectedRoute>} />
          <Route path="/admin/support/:id" element={<ProtectedRoute requireBoardMember><SupportEdit /></ProtectedRoute>} />
          <Route path="/admin/feedback" element={<ProtectedRoute requireBoardMember><Feedback /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requireBoardMember><Users /></ProtectedRoute>} />
          <Route path="/admin/communication" element={<ProtectedRoute requireBoardMember><Communication /></ProtectedRoute>} />
          
          {/* Admin-Only Routes - restricted to admin role */}
          <Route path="/admin/reports" element={<ProtectedRoute requireAdmin><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/gamechanger" element={<ProtectedRoute requireAdmin><GameChangerSync /></ProtectedRoute>} />
          <Route path="/admin/programs" element={<ProtectedRoute requireAdmin><Programs /></ProtectedRoute>} />
          <Route path="/admin/programs/new" element={<ProtectedRoute requireAdmin><ProgramEdit /></ProtectedRoute>} />
          <Route path="/admin/programs/:id" element={<ProtectedRoute requireAdmin><ProgramEdit /></ProtectedRoute>} />
          <Route path="/admin/divisions" element={<ProtectedRoute requireAdmin><Divisions /></ProtectedRoute>} />
          <Route path="/admin/divisions/new" element={<ProtectedRoute requireAdmin><DivisionEdit /></ProtectedRoute>} />
          <Route path="/admin/divisions/:id" element={<ProtectedRoute requireAdmin><DivisionEdit /></ProtectedRoute>} />
          <Route path="/admin/site-content" element={<ProtectedRoute requireBoardMember><SiteContent /></ProtectedRoute>} />
          <Route path="/admin/site-content/new" element={<ProtectedRoute requireBoardMember><SiteContentEdit /></ProtectedRoute>} />
          <Route path="/admin/site-content/:id" element={<ProtectedRoute requireBoardMember><SiteContentEdit /></ProtectedRoute>} />
          <Route path="/admin/drafts" element={<ProtectedRoute requireAdmin><Drafts /></ProtectedRoute>} />
          <Route path="/admin/drafts/new" element={<ProtectedRoute requireAdmin><DraftEdit /></ProtectedRoute>} />
          <Route path="/admin/drafts/:id" element={<ProtectedRoute requireAdmin><DraftEdit /></ProtectedRoute>} />
          <Route path="/admin/drafts/:id/live" element={<ProtectedRoute requireAdmin><DraftLive /></ProtectedRoute>} />
          <Route path="/admin/commissioner" element={<ProtectedRoute requireAdmin><Commissioner /></ProtectedRoute>} />
          <Route path="/admin/registration-codes" element={<ProtectedRoute requireAdmin><RegistrationCodes /></ProtectedRoute>} />
          <Route path="/admin/registration-codes/new" element={<ProtectedRoute requireAdmin><RegistrationCodeEdit /></ProtectedRoute>} />
          <Route path="/admin/registration-codes/:id" element={<ProtectedRoute requireAdmin><RegistrationCodeEdit /></ProtectedRoute>} />
          <Route path="/admin/committee-tasks" element={<ProtectedRoute requireAdmin><CommitteeTasks /></ProtectedRoute>} />
          <Route path="/admin/concessions" element={<ProtectedRoute requireAdmin><Concessions /></ProtectedRoute>} />
          <Route path="/coach" element={<ProtectedRoute requireCoach><CoachLayout /></ProtectedRoute>}>
            <Route index element={<CoachDashboard />} />
            <Route path="drafts/:id" element={<CoachDraftRoom />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </FeedbackProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
