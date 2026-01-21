import { NavLink, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Database, Users, HelpCircle, Heart, Home, FileText, BarChart3, RefreshCw, MapPin, Calendar, User, ClipboardList, UsersRound, MessageSquare, UserCog, ExternalLink, Lock } from "lucide-react";
import cdblSidebarLogo from "@/assets/cdbl-sidebar-logo.png";
import { supabase } from "@/integrations/supabase/client";

// Items accessible by board members and admins
const boardMemberItems = [
  { title: "Dashboard", url: "/admin", icon: Home },
  { title: "Players", url: "/admin/players", icon: Users },
  { title: "Teams", url: "/admin/teams", icon: Database },
  { title: "Coaches", url: "/admin/coaches", icon: Users },
  { title: "Schedule", url: "/admin/schedule", icon: Calendar },
  { title: "Facilities", url: "/admin/facilities", icon: MapPin },
  { title: "FAQs", url: "/admin/faqs", icon: HelpCircle },
  { title: "Support", url: "/admin/support", icon: Heart },
];

// Items only accessible by admins
const adminOnlyItems = [
  { title: "Drafts", url: "/admin/drafts", icon: ClipboardList },
  { title: "Reports", url: "/admin/reports", icon: BarChart3 },
  { title: "GameChanger", url: "/admin/gamechanger", icon: RefreshCw },
  { title: "Commissioner", url: "/admin/commissioner", icon: UsersRound },
  { title: "Site Content", url: "/admin/site-content", icon: FileText },
  { title: "Programs", url: "/admin/programs", icon: Database },
  { title: "Divisions", url: "/admin/divisions", icon: Users },
];

export function AdminSidebar() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: hasAdminRole } = await supabase
          .rpc('has_role', {
            _user_id: session.user.id,
            _role: 'admin'
          });
        setIsAdmin(!!hasAdminRole);
      }
    };

    checkAdminRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdminRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-primary-foreground/20 text-primary-foreground font-medium hover:bg-primary-foreground/30"
      : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground";

  return (
    <Sidebar className="w-60">
      <SidebarContent className="bg-primary">
        <div className="pl-[10px]">
          <Link to="/" className="flex items-center justify-start pr-4 py-6 hover:opacity-80 transition-opacity">
            <img 
              src={cdblSidebarLogo} 
              alt="CDBL Logo" 
              className="h-14 w-auto object-contain"
            />
          </Link>
        </div>
        <SidebarGroup className="pl-[25px]">
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Board Member Items - visible to all authenticated admin users */}
              {boardMemberItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavClass}>
                      <item.icon className="h-4 w-4" />
                      <span className="ml-2">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Admin-Only Items - only visible to admins */}
              {isAdmin && (
                <>
                  <div className="my-2 border-t border-primary-foreground/20" />
                  <div className="flex items-center gap-1 px-2 py-1 text-xs text-primary-foreground/50 uppercase tracking-wider">
                    <Lock className="h-3 w-3" />
                    <span>Admin Only</span>
                  </div>
                  {adminOnlyItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} end className={getNavClass}>
                          <item.icon className="h-4 w-4" />
                          <span className="ml-2">{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto pl-[25px] pb-6">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/feedback" className={getNavClass}>
                    <MessageSquare className="h-4 w-4" />
                    <span className="ml-2">Feedback</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/users" className={getNavClass}>
                    <UserCog className="h-4 w-4" />
                    <span className="ml-2">Users</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/profile" className={getNavClass}>
                    <User className="h-4 w-4" />
                    <span className="ml-2">Profile</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/" className="text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground">
                    <ExternalLink className="h-4 w-4" />
                    <span className="ml-2">Return to Site</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
