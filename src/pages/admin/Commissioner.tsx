import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  ClipboardList, 
  UsersRound, 
  Users, 
  UserPlus, 
  CalendarDays, 
  Megaphone, 
  Settings 
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { useSearchParams } from "react-router-dom";

// Import commissioner tab content components
import CommissionerDashboard from "@/pages/commissioner/Dashboard";
import CommissionerRegistrations from "@/pages/commissioner/Registrations";
import CommissionerTeams from "@/pages/commissioner/Teams";
import CommissionerCoaches from "@/pages/commissioner/Coaches";
import CommissionerDrafts from "@/pages/commissioner/Drafts";
import CommissionerSchedule from "@/pages/commissioner/Schedule";
import CommissionerStandings from "@/pages/commissioner/Standings";
import CommissionerCommunication from "@/pages/commissioner/Communication";
import CommissionerSettings from "@/pages/commissioner/Settings";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "registrations", label: "Registrations", icon: ClipboardList },
  { id: "teams", label: "Teams", icon: UsersRound },
  { id: "coaches", label: "Coaches", icon: Users },
  { id: "drafts", label: "Drafts", icon: UserPlus },
  { id: "schedule", label: "Schedule", icon: CalendarDays },
  { id: "standings", label: "Standings", icon: null },
  { id: "communication", label: "Communication", icon: Megaphone },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Commissioner() {
  const [params] = useSearchParams();
  const [activeTab, setActiveTab] = useState(params.get("tab") ?? "dashboard");

  return (
    <AdminLayout>
        <div>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Commissioner Portal</h1>
              <p className="text-muted-foreground">
                Manage your league programs and divisions
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-2 data-[state=active]:bg-background"
                  >
                    {tab.icon && <tab.icon className="h-5 w-5" />}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="dashboard" className="mt-6">
                <CommissionerDashboard />
              </TabsContent>

              <TabsContent value="registrations" className="mt-6">
                <CommissionerRegistrations />
              </TabsContent>

              <TabsContent value="teams" className="mt-6">
                <CommissionerTeams />
              </TabsContent>

              <TabsContent value="coaches" className="mt-6">
                <CommissionerCoaches />
              </TabsContent>

              <TabsContent value="drafts" className="mt-6">
                <CommissionerDrafts />
              </TabsContent>

              <TabsContent value="schedule" className="mt-6">
                <CommissionerSchedule />
              </TabsContent>

              <TabsContent value="standings" className="mt-6">
                <CommissionerStandings />
              </TabsContent>

              <TabsContent value="communication" className="mt-6">
                <CommissionerCommunication />
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <CommissionerSettings />
              </TabsContent>
            </Tabs>
          </div>
        </div>
    </AdminLayout>
  );
}
