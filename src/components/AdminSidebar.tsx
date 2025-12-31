import { NavLink, Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Database, Users, HelpCircle, Heart, Home, LogOut, FileText, BarChart3, RefreshCw, MapPin, Calendar, User, ClipboardList } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import cdblSidebarLogo from "@/assets/cdbl-sidebar-logo.png";

const adminItems = [
  { title: "Dashboard", url: "/admin", icon: Home },
  { title: "Players", url: "/admin/players", icon: Users },
  { title: "Teams", url: "/admin/teams", icon: Database },
  { title: "Coaches", url: "/admin/coaches", icon: Users },
  { title: "Drafts", url: "/admin/drafts", icon: ClipboardList },
  { title: "Schedule", url: "/admin/schedule", icon: Calendar },
  { title: "Venues", url: "/admin/venues", icon: MapPin },
  { title: "Reports", url: "/admin/reports", icon: BarChart3 },
  { title: "GameChanger", url: "/admin/gamechanger", icon: RefreshCw },
  { title: "Site Content", url: "/admin/site-content", icon: FileText },
  { title: "Programs", url: "/admin/programs", icon: Database },
  { title: "Divisions", url: "/admin/divisions", icon: Users },
  { title: "FAQs", url: "/admin/faqs", icon: HelpCircle },
  { title: "Support", url: "/admin/support", icon: Heart },
];

export function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-primary-foreground/20 text-primary-foreground font-medium hover:bg-primary-foreground/30"
      : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground";

  return (
    <Sidebar className="w-60">
      <SidebarContent 
        className="bg-primary"
        style={{
          '--sidebar-foreground': 'hsl(0 0% 100%)',
          '--sidebar-accent': 'hsl(0 0% 100% / 0.1)',
          '--sidebar-accent-foreground': 'hsl(0 0% 100%)',
        } as React.CSSProperties}
      >
        <SidebarGroup>
          <Link to="/" className="block px-4 py-4 hover:opacity-80 transition-opacity">
            <img 
              src={cdblSidebarLogo} 
              alt="CDBL Logo" 
              className="h-8 w-auto object-contain"
            />
          </Link>
          <SidebarGroupContent className="px-2">
            <SidebarMenu className="gap-1">
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={({ isActive }) =>
                      `flex items-center gap-3 ${getNavClass({ isActive })}`
                    }>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto border-t border-primary-foreground/10">
          <SidebarGroupContent className="px-2 py-4">
            <SidebarMenu className="gap-1">
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/profile" className={({ isActive }) =>
                    `flex items-center gap-3 ${getNavClass({ isActive })}`
                  }>
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
