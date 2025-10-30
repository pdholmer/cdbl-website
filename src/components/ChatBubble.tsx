import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  message: string;
  type?: 'bot' | 'user';
  className?: string;
}

export const ChatBubble = ({ message, type = 'bot', className }: ChatBubbleProps) => {
  return (
    <div
      className={cn(
        "flex",
        type === 'bot' ? "justify-start" : "justify-end",
        className
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 animate-fade-in",
          type === 'bot'
            ? "bg-muted text-foreground rounded-tl-none"
            : "bg-primary text-primary-foreground rounded-tr-none"
        )}
      >
        <p className="text-sm leading-relaxed">{message}</p>
      </div>
    </div>
  );
};
