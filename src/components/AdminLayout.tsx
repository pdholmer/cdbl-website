import { SeasonCutoffBanner } from "@/components/admin/SeasonCutoffBanner";
import { AppShell } from "@/components/shell/AppShell";

interface AdminLayoutProps {
  children: React.ReactNode;
}

/** Admin pages: shared signed-in shell, League office navigation. */
export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AppShell area="admin">
      <div className="min-w-0 p-4 md:p-6">
        <SeasonCutoffBanner />
        {children}
      </div>
    </AppShell>
  );
}
