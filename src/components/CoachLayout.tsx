import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Home, ClipboardList, LogOut, User } from "lucide-react";
import logo from "@/assets/cdbl-sidebar-logo.png";

const coachItems = [
  { title: "Dashboard", url: "/coach", icon: Home },
  { title: "My Drafts", url: "/coach/drafts", icon: ClipboardList },
];

export const CoachLayout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : "hover:bg-muted";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar>
          <SidebarHeader className="p-4">
            <img src={logo} alt="CDBL Logo" className="h-12 w-auto" />
            <span className="text-sm font-medium text-muted-foreground mt-2">
              Coach Portal
            </span>
          </SidebarHeader>

          <SidebarContent className="px-2">
            <SidebarMenu>
              {coachItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavClass}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <div className="mt-auto p-4 border-t space-y-2">
            <NavLink to="/coach/profile" className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-sm">
              <User className="h-4 w-4" />
              <span>My Profile</span>
            </NavLink>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </Sidebar>

        <SidebarInset className="flex-1">
          <Outlet />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
