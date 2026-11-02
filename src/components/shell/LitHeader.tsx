import { Link } from "react-router-dom";
import seal from "@/assets/cdbl-seal.png";
import { cn } from "@/lib/utils";

interface LitHeaderProps {
  label: string;
  title: string;
  /** Right-side actions (account, sign out). */
  actions?: React.ReactNode;
  /** Small link on the label line (for example "Back to cdbaseball.org" on family phones). */
  notice?: React.ReactNode;
  /** Hide the seal at md+ (the sidebar shows it there). */
  sealPhoneOnly?: boolean;
  className?: string;
}

/** Shared lit header ("stage") with the piping line, used by AppShell and AuthShell. */
export const LitHeader = ({ label, title, actions, notice, sealPhoneOnly, className }: LitHeaderProps) => (
  <header className={cn("ngb-stage tex-twill", className)}>
    <div className="mx-auto flex w-full max-w-6xl items-start gap-3 px-4 pb-5 pt-4 sm:px-6 lg:px-8">
      <Link
        to="/"
        aria-label="CDBL home"
        className={cn("flex h-11 w-11 shrink-0 items-center justify-center", sealPhoneOnly && "md:hidden")}
      >
        <img src={seal} alt="Central District Baseball League" className="h-9 w-9 object-contain" />
      </Link>
      <div className="min-w-0 flex-1 pt-1">
        <div className="flex items-start justify-between gap-3">
          <p className="font-label pt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
          {notice}
        </div>
        <h1 className="ngb-headline mt-1 break-words font-display font-black uppercase leading-[0.95] text-foreground">{title}</h1>
      </div>
      {actions}
    </div>
    <div className="ngb-piping" aria-hidden />
  </header>
);

export default LitHeader;
