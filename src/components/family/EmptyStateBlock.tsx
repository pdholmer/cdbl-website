import { cn } from "@/lib/utils";

interface EmptyStateBlockProps {
  children: React.ReactNode;
  className?: string;
}

/** Plain-sentence empty state — no illustration, never an empty white box. */
export const EmptyStateBlock = ({ children, className }: EmptyStateBlockProps) => (
  <p className={cn("text-sm leading-relaxed text-muted-foreground", className)}>
    {children}
  </p>
);

export default EmptyStateBlock;
