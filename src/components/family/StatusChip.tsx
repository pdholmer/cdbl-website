import { cn } from "@/lib/utils";

export type ChipTone = "brand" | "neutral" | "warning" | "destructive" | "success";

interface StatusChipProps {
  children: React.ReactNode;
  tone?: ChipTone;
  className?: string;
}

const TONES: Record<ChipTone, string> = {
  brand: "bg-primary/10 text-primary",
  neutral: "bg-muted text-muted-foreground",
  warning: "bg-warning text-warning-foreground",
  destructive: "bg-destructive text-destructive-foreground",
  success: "bg-success text-success-foreground",
};

export const StatusChip = ({ children, tone = "neutral", className }: StatusChipProps) => (
  <span
    className={cn(
      "inline-flex max-w-[9rem] shrink-0 items-center truncate rounded-full px-2.5 py-1 text-xs font-semibold",
      TONES[tone],
      className,
    )}
  >
    {children}
  </span>
);

export default StatusChip;
