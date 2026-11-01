import { Link } from "react-router-dom";
import seal from "@/assets/cdbl-seal.png";

/**
 * Sign-in and two-step frame. Phone: centered form. Tablet: wider form.
 * Desktop: brand panel beside the form so it never reads as a phone screen.
 */
export const AuthShell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
    <aside className="hidden lg:flex flex-col justify-between bg-primary p-12 text-primary-foreground">
      <Link to="/" aria-label="CDBL home" className="flex items-center gap-3 w-fit">
        <img src={seal} alt="" className="h-14 w-14 object-contain" />
        <span className="font-heading text-lg font-bold">Central District Baseball League</span>
      </Link>
      <p className="max-w-md font-heading text-3xl font-bold leading-tight">
        Your family, your teams and your league business, in one place.
      </p>
      <p className="text-sm text-primary-foreground/70">cdbaseball.org</p>
    </aside>
    <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8">
      <div className="w-full max-w-md md:max-w-lg">
        <Link to="/" aria-label="CDBL home" className="mb-6 flex h-11 w-11 items-center justify-center lg:hidden">
          <img src={seal} alt="" className="h-11 w-11 object-contain" />
        </Link>
        {children}
      </div>
    </main>
  </div>
);

export default AuthShell;
