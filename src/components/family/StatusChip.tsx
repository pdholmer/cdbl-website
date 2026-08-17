import { cn } from "@/lib/utils";

interface StatusChipProps {
  children: React.ReactNode;
  tone?: "brand" | "neutral";
  className?: string;
}

export const StatusChip = ({ children, tone = "neutral", className }: StatusChipProps) => (
  <span
    className={cn(
      "inline-flex max-w-[9rem] items-center truncate rounded-full px-2.5 py-1 text-xs font-semibold",
      tone === "brand"
        ? "bg-primary/10 text-primary"
        : "bg-muted text-muted-foreground",
      className,
    )}
  >
    {children}
  </span>
);

export default StatusChip;
