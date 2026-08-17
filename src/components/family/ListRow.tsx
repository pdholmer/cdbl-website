import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ListRowProps {
  /** Initials rendered in a blue-tinted circle. */
  initials?: string;
  icon?: React.ReactNode;
  title: string;
  subtitle?: string | null;
  trailing?: React.ReactNode;
  chevron?: boolean;
  onClick?: () => void;
  className?: string;
}

export const ListRow = ({
  initials,
  icon,
  title,
  subtitle,
  trailing,
  chevron,
  onClick,
  className,
}: ListRowProps) => {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      {...(onClick ? { type: "button" as const, onClick } : {})}
      className={cn(
        "flex w-full min-h-[56px] items-center gap-3 px-4 py-3 text-left",
        "border-b border-border/60 last:border-b-0",
        onClick && "transition-colors hover:bg-primary/[0.04] active:bg-primary/[0.07]",
        className,
      )}
    >
      {(initials || icon) && (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[hsl(217_100%_92%)] text-sm font-bold text-[hsl(217_100%_26%)]">
          {icon ?? initials}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold text-foreground">{title}</span>
        {subtitle && (
          <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">{subtitle}</span>
        )}
      </span>
      {trailing}
      {chevron && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
    </Tag>
  );
};

export default ListRow;
