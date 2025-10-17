import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Database, Users, HelpCircle, Heart, BookOpen, Shield } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const adminSections = [
    { title: "Programs", description: "Manage In-House and Travel programs", icon: Database, path: "/admin/programs" },
    { title: "Divisions", description: "Manage age groups and divisions", icon: Users, path: "/admin/divisions" },
    { title: "FAQs", description: "Manage frequently asked questions", icon: HelpCircle, path: "/admin/faqs" },
    { title: "Support Options", description: "Manage donations, sponsors, volunteers", icon: Heart, path: "/admin/support" },
    { title: "Resources", description: "Manage coach resources", icon: BookOpen, path: "/admin/resources" },
    { title: "Rules & Policies", description: "Manage rules and policies", icon: Shield, path: "/admin/rules" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => (
            <Link key={section.path} to={section.path}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <section.icon className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
