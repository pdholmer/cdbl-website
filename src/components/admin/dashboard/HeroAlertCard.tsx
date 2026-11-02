import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface HeroAlertCardProps {
  type: "critical-feedback" | "live-draft";
  title: string;
  description: string;
  href: string;
  meta?: string;
  /** Show as a flood card. Only one flood per screen; the dashboard decides. */
  flood?: boolean;
}

export function HeroAlertCard({ type, title, description, href, meta, flood = true }: HeroAlertCardProps) {
  const isLiveDraft = type === "live-draft";

  if (!flood) {
    return (
      <div className="tex-mesh rounded-xl border border-border bg-card p-6 text-card-foreground">
        <p className="font-label text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {isLiveDraft ? "Live" : "Urgent"}
        </p>
        <h3 className="mt-1 text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        {meta && <p className="mt-2 text-xs font-medium text-muted-foreground">{meta}</p>}
        <Link
          to={href}
          className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-primary px-5 font-label text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {isLiveDraft ? "Open live draft" : "Review now"}
        </Link>
      </div>
    );
  }

  return (
    <Link to={href} className="block group">
      <div className={cn("relative overflow-hidden rounded-xl border p-6 min-h-[120px]", isLiveDraft ? "card-flood" : "card-alert")}>
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 motion-safe:animate-ping" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
          </span>
          <span className="text-xs font-medium uppercase tracking-wide text-white">{isLiveDraft ? "Live" : "Urgent"}</span>
        </div>
        <div className="pr-20">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-white/90">{description}</p>
          {meta && <p className="mt-2 text-xs font-medium text-white">{meta}</p>}
          <span className="mt-3 inline-block text-sm font-medium text-white underline underline-offset-4">Take action</span>
        </div>
      </div>
    </Link>
  );
}
