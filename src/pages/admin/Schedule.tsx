import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GamesTab } from "@/components/admin/schedule/GamesTab";
import { PracticesTab } from "@/components/admin/schedule/PracticesTab";
import { EventsTab } from "@/components/admin/schedule/EventsTab";
import { ScheduleImportDialog } from "@/components/admin/schedule/ScheduleImportDialog";
import { ExternalLink, MapPin } from "lucide-react";

const AdminSchedule = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Schedule & Events</h1>
            <p className="text-muted-foreground">Manage games, practices, events, and league calendar</p>
          </div>
          <div className="flex gap-2">
            <Link to="/schedule" target="_blank">
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />View Public Schedule
              </Button>
            </Link>
            <Link to="/admin/facilities">
              <Button variant="outline" size="sm">
                <MapPin className="mr-2 h-4 w-4" />Facilities
              </Button>
            </Link>
            <ScheduleImportDialog />
          </div>
        </div>

        <Tabs defaultValue="events">
          <TabsList>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="games">Games</TabsTrigger>
            <TabsTrigger value="practices">Practices</TabsTrigger>
          </TabsList>
          <TabsContent value="events"><EventsTab /></TabsContent>
          <TabsContent value="games"><GamesTab /></TabsContent>
          <TabsContent value="practices"><PracticesTab /></TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSchedule;
