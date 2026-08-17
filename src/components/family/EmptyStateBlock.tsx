import { cn } from "@/lib/utils";

interface EmptyStateBlockProps {
  children: React.ReactNode;
  /** Optional blue-tinted leading icon so the state reads as designed, not leftover. */
  icon?: React.ReactNode;
  className?: string;
}

/** Plain-sentence empty state — no illustration, never an empty white box. */
export const EmptyStateBlock = ({ children, icon, className }: EmptyStateBlockProps) => {
  if (!icon) {
    return (
      <p className={cn("text-sm leading-relaxed text-muted-foreground", className)}>{children}</p>
    );
  }
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(217_100%_94%)] text-[hsl(217_100%_30%)]">
        {icon}
      </span>
      <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
};

export default EmptyStateBlock;
