import { NavLink, Link, useLocation } from "react-router-dom";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Database, Users, HelpCircle, Heart, Home, FileText, BarChart3, 
  RefreshCw, MapPin, Calendar, User, ClipboardList, UsersRound, 
  MessageSquare, UserCog, ExternalLink, Lock, Tag, CheckSquare, 
  Coffee, ChevronDown, Settings, Megaphone
} from "lucide-react";
import cdblSidebarLogo from "@/assets/cdbl-sidebar-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface NavSection {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: { title: string; url: string; icon: React.ComponentType<{ className?: string }> }[];
  adminOnly?: boolean;
}

const navSections: NavSection[] = [
  {
    title: "People",
    icon: Users,
    items: [
      { title: "Players", url: "/admin/players", icon: Users },
      { title: "Teams", url: "/admin/teams", icon: Database },
      { title: "Coaches", url: "/admin/coaches", icon: UserCog },
    ],
  },
  {
    title: "Schedule & Events",
    icon: Calendar,
    items: [
      { title: "Schedule", url: "/admin/schedule", icon: Calendar },
      { title: "Facilities", url: "/admin/facilities", icon: MapPin },
      { title: "Drafts", url: "/admin/drafts", icon: ClipboardList },
    ],
  },
  {
    title: "Content",
    icon: FileText,
    items: [
      { title: "Site Content", url: "/admin/site-content", icon: FileText },
      { title: "FAQs", url: "/admin/faqs", icon: HelpCircle },
      { title: "Support", url: "/admin/support", icon: Heart },
    ],
  },
  {
    title: "Operations",
    icon: Settings,
    items: [
      { title: "Registration Codes", url: "/admin/registration-codes", icon: Tag },
      { title: "Committee Tasks", url: "/admin/committee-tasks", icon: CheckSquare },
      { title: "Concessions", url: "/admin/concessions", icon: Coffee },
      { title: "Commissioner", url: "/admin/commissioner", icon: UsersRound },
    ],
    adminOnly: true,
  },
  {
    title: "System",
    icon: BarChart3,
    items: [
      { title: "Programs", url: "/admin/programs", icon: Database },
      { title: "Divisions", url: "/admin/divisions", icon: Users },
      { title: "Reports", url: "/admin/reports", icon: BarChart3 },
      { title: "GameChanger", url: "/admin/gamechanger", icon: RefreshCw },
    ],
    adminOnly: true,
  },
];

export function AdminSidebar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

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

  // Check if any item in a section is active
  const isSectionActive = (section: NavSection) => {
    return section.items.some(item => location.pathname === item.url);
  };

  // Filter sections based on admin status
  const visibleSections = navSections.filter(section => !section.adminOnly || isAdmin);

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

        <SidebarGroup className="pl-[25px] pr-4">
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard - Always visible at top */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin" end className={getNavClass}>
                    <Home className="h-4 w-4" />
                    <span className="ml-2">Dashboard</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Collapsible Sections */}
              {visibleSections.map((section) => (
                <Collapsible
                  key={section.title}
                  defaultOpen={isSectionActive(section)}
                  className="mt-1"
                >
                  <CollapsibleTrigger className={cn(
                    "flex items-center justify-between w-full py-2 px-2 text-sm rounded-md transition-colors",
                    "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground",
                    isSectionActive(section) && "text-primary-foreground"
                  )}>
                    <div className="flex items-center gap-2">
                      <section.icon className="h-4 w-4" />
                      <span className="font-medium">{section.title}</span>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4 pt-1 space-y-0.5">
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton asChild>
                          <NavLink to={item.url} end className={getNavClass}>
                            <item.icon className="h-4 w-4" />
                            <span className="ml-2">{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}

              {/* Admin Only Indicator */}
              {isAdmin && (
                <div className="flex items-center gap-1 px-2 py-2 mt-2 text-xs text-primary-foreground/40 uppercase tracking-wider">
                  <Lock className="h-3 w-3" />
                  <span>Admin sections above</span>
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer Navigation */}
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
