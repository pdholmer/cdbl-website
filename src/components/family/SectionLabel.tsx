import { cn } from "@/lib/utils";

interface SectionLabelProps {
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

/** Uppercase, letterspaced section label that sits above a grouped card. */
export const SectionLabel = ({ children, action, className }: SectionLabelProps) => (
  <div className={cn("flex items-end justify-between gap-3 px-1 pb-2", className)}>
    <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </h2>
    {action}
  </div>
);

export default SectionLabel;
