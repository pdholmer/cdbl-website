import { Link } from "react-router-dom";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Users, HelpCircle, Heart, BookOpen, Shield, Calendar, MapPin, BarChart3, RefreshCw } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";

const Dashboard = () => {
const adminSections = [
    { title: "Player Registration", description: "Manage player registrations and profiles", icon: Users, path: "/admin/players" },
    { title: "Team Management", description: "Manage teams and rosters", icon: Shield, path: "/admin/teams" },
    { title: "Coach Management", description: "Manage coaches and volunteers", icon: Users, path: "/admin/coaches" },
    { title: "Game Schedule", description: "Manage games and schedules", icon: Calendar, path: "/admin/schedule" },
    { title: "Venues", description: "Manage fields and facilities", icon: MapPin, path: "/admin/venues" },
    { title: "Reports & Analytics", description: "Generate reports and view statistics", icon: BarChart3, path: "/admin/reports" },
    { title: "GameChanger Sync", description: "Sync with GameChanger platform", icon: RefreshCw, path: "/admin/gamechanger" },
    { title: "Site Content", description: "Manage all website text content", icon: BookOpen, path: "/admin/site-content" },
    { title: "Programs", description: "Manage In-House and Travel programs", icon: Database, path: "/admin/programs" },
    { title: "Divisions", description: "Manage age groups and divisions", icon: Users, path: "/admin/divisions" },
    { title: "FAQs", description: "Manage frequently asked questions", icon: HelpCircle, path: "/admin/faqs" },
    { title: "Support Options", description: "Manage donations, sponsors, volunteers", icon: Heart, path: "/admin/support" },
  ];

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-8">Manage CDBL content and settings</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => (
            <Link key={section.path} to={section.path}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <section.icon className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
