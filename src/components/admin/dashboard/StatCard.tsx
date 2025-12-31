import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  href: string;
  trend?: "up" | "down" | "neutral";
  accentColor?: "default" | "success" | "warning" | "destructive";
  isLoading?: boolean;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  href,
  trend,
  accentColor = "default",
  isLoading = false,
}: StatCardProps) {
  const accentClasses = {
    default: "text-primary bg-primary/10",
    success: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
    warning: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30",
    destructive: "text-destructive bg-destructive/10",
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-card p-6 min-h-[140px]">
        <div className="flex items-start justify-between">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-10 w-20 mt-4" />
        <Skeleton className="h-4 w-32 mt-2" />
      </div>
    );
  }

  return (
    <Link to={href} className="block group">
      <div
        className={cn(
          "rounded-2xl border bg-card p-6 min-h-[140px]",
          "transition-all duration-200",
          "hover:shadow-lg hover:scale-[1.02] hover:border-primary/30",
          "backdrop-blur-sm bg-card/80"
        )}
      >
        <div className="flex items-start justify-between">
          <div className={cn("rounded-xl p-2.5", accentClasses[accentColor])}>
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {title}
          </span>
        </div>

        <div className="mt-4">
          <p className="text-4xl font-bold text-foreground tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              {trend === "up" && (
                <svg className="h-3 w-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
              {trend === "down" && (
                <svg className="h-3 w-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              {subtitle}
            </p>
          )}
        </div>

        <div className="mt-3 flex items-center text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          View details
          <svg className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border bg-card p-6 min-h-[140px]">
      <div className="flex items-start justify-between">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-10 w-20 mt-4" />
      <Skeleton className="h-4 w-32 mt-2" />
    </div>
  );
}
