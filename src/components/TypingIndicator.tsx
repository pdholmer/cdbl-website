export const TypingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3 animate-fade-in">
        <div className="flex space-x-1.5">
          <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
};
