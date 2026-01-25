const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1 px-4 py-3 max-w-[80px] bg-chat-assistant rounded-2xl rounded-bl-md">
      <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
};

export default TypingIndicator;
