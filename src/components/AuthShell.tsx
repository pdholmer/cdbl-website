import { LitHeader } from "@/components/shell/LitHeader";

interface AuthShellProps {
  /** Lit-header headline for this screen. */
  title?: string;
  children: React.ReactNode;
}

/** Sign-in and two-step frame: lit header, piping, one centered card area. No sidebar or tabs. */
export const AuthShell = ({ title = "Sign in", children }: AuthShellProps) => (
  <div className="min-h-screen overflow-x-hidden bg-background">
    <LitHeader label="Central District Baseball League" title={title} />
    <main className="mx-auto w-full max-w-[440px] px-4 py-8 sm:py-12">{children}</main>
  </div>
);

export default AuthShell;
