import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { CommissionerSidebar } from "@/components/CommissionerSidebar";

export function CommissionerLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CommissionerSidebar />
        <main className="flex-1">
          <header className="h-14 border-b flex items-center px-4 bg-background">
            <SidebarTrigger className="mr-4" />
          </header>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
