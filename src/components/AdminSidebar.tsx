import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Database, Users, HelpCircle, Heart, Home, LogOut, FileText, BarChart3, RefreshCw, MapPin, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const adminItems = [
  { title: "Dashboard", url: "/admin", icon: Home },
  { title: "Players", url: "/admin/players", icon: Users },
  { title: "Teams", url: "/admin/teams", icon: Database },
  { title: "Coaches", url: "/admin/coaches", icon: Users },
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
  const { state } = useSidebar();
  const navigate = useNavigate();
  const collapsed = state === "collapsed";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-primary text-primary-foreground font-medium hover:bg-primary/90"
      : "hover:bg-muted/50";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {!collapsed && "CDBL Admin"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavClass}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span className="ml-2">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span className="ml-2">Logout</span>}
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
