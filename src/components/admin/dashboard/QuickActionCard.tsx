import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionCardProps {
  title: string;
  icon?: LucideIcon;
  href: string;
  description?: string;
}

export function QuickActionCard({ title, href, description }: QuickActionCardProps) {
  return (
    <Link to={href} className="block group">
      <div
        className={cn(
          "rounded-2xl border bg-card p-4 min-h-[80px]",
          "flex items-center gap-4",
          "transition-all duration-200",
          "hover:border-primary/30"
        )}
      >
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
            {title}
          </h4>
          {description && (
            <p className="text-xs text-muted-foreground truncate">{description}</p>
          )}
        </div>
        <svg
          className="h-4 w-4 text-muted-foreground group-hover:text-primary transform group-hover:translate-x-1 transition-all"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
