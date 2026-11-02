import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

interface HeroAlertCardProps {
  type: "critical-feedback" | "live-draft";
  title: string;
  description: string;
  href: string;
  meta?: string;
}

export function HeroAlertCard({ type, title, description, href, meta }: HeroAlertCardProps) {
  const isLiveDraft = type === "live-draft";
  
  return (
    <Link to={href} className="block group">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl p-6 min-h-[120px]",
          "border transition-colors duration-200",
          isLiveDraft ? "card-flood" : "card-alert"
        )}
      >
        {/* Animated pulse indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span
            className={cn(
              "relative flex h-3 w-3",
            )}
          >
            <span
              className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-white"
              )}
            />
            <span
              className={cn(
                "relative inline-flex rounded-full h-3 w-3 bg-white"
              )}
            />
          </span>
          <span className={cn(
            "text-xs font-medium uppercase tracking-wide text-white"
          )}>
            {isLiveDraft ? "Live" : "Urgent"}
          </span>
        </div>

        <div className="flex items-start gap-4">

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white">
              {title}
            </h3>
            <p className="text-sm text-white/90 mt-1">
              {description}
            </p>
            {meta && (
              <p className={cn(
                "text-xs font-medium mt-2 text-white"
              )}>
                {meta}
              </p>
            )}
          </div>

          <div className="hidden sm:flex items-center text-white">
            <span className="text-sm font-medium mr-1">Take Action</span>
            <svg
              className="h-4 w-4 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
