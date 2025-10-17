import { NavLink, Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Database, Users, HelpCircle, Heart, Home, LogOut, FileText, BarChart3, RefreshCw, MapPin, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import cdblSidebarLogo from "@/assets/cdbl-sidebar-logo.png";

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
      ? "bg-primary-foreground/20 text-primary-foreground font-medium hover:bg-primary-foreground/30"
      : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent className="bg-primary">
        <SidebarGroup>
          <div className="relative">
            <SidebarTrigger className="absolute top-2 right-2 text-primary-foreground hover:bg-primary-foreground/10" />
          </div>
          <Link to="/" className="flex items-center justify-center p-4 hover:opacity-80 transition-opacity">
            <img 
              src={cdblSidebarLogo} 
              alt="CDBL Logo" 
              className={collapsed ? "h-8 w-auto object-contain" : "h-20 w-auto object-contain"}
            />
          </Link>
          <SidebarGroupLabel className="text-primary-foreground">
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
              className="w-full justify-start text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
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
