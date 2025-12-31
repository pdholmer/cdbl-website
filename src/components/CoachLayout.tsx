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
        <Sidebar className="w-60">
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="CDBL Logo" className="h-10 w-auto" />
              <div>
                <h2 className="font-semibold text-foreground">Coach</h2>
                <p className="text-xs text-muted-foreground">Portal</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-2">
            <SidebarMenu className="gap-1 py-2">
              {coachItems.map((item) => (
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
          </SidebarContent>

          <div className="mt-auto border-t p-4">
            <SidebarMenu className="gap-1">
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/coach/profile" className={({ isActive }) =>
                    `flex items-center gap-3 ${getNavClass({ isActive })}`
                  }>
                    <User className="h-4 w-4" />
                    <span>My Profile</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </Sidebar>

        <SidebarInset className="flex-1">
          <Outlet />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
