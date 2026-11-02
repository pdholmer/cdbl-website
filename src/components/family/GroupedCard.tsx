import { cn } from "@/lib/utils";

interface GroupedCardProps {
  children: React.ReactNode;
  className?: string;
  /** Removes inner padding so list rows can span edge to edge. */
  flush?: boolean;
}

/** iOS-style grouped card: 16px radius, blue-tinted soft shadow, hairline border. */
export const GroupedCard = ({ children, className, flush }: GroupedCardProps) => (
  <div
    className={cn(
      "rounded-2xl border border-border bg-card",
      flush ? "overflow-hidden" : "p-4 sm:p-5",
      className,
    )}
  >
    {children}
  </div>
);

export default GroupedCard;
