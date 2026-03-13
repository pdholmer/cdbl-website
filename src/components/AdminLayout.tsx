import { Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import sidebarLogo from "@/assets/cdbl-sidebar-logo.png";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 bg-primary px-4 md:hidden">
            <SidebarTrigger className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" />
            <Link to="/admin" className="flex items-center gap-2">
              <img src={sidebarLogo} alt="CDBL" className="h-7" />
              <span className="font-semibold text-primary-foreground text-sm">Admin</span>
            </Link>
          </header>
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
