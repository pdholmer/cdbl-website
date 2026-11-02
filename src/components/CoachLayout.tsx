import { Outlet } from "react-router-dom";
import { AppShell } from "@/components/shell/AppShell";

/** Coach area: shared signed-in shell with coach tabs. */
export const CoachLayout = () => (
  <AppShell area="coach">
    <Outlet />
  </AppShell>
);

export default CoachLayout;
