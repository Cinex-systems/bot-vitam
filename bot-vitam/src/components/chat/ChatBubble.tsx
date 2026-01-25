import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatBubbleProps {
  onClick: () => void;
  hasUnread?: boolean;
}

const ChatBubble = ({ onClick, hasUnread }: ChatBubbleProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'w-14 h-14 rounded-full',
        'bg-primary text-primary-foreground',
        'shadow-lg hover:shadow-xl',
        'flex items-center justify-center',
        'transition-all duration-300 ease-out',
        'hover:scale-110 active:scale-95',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
      )}
      aria-label="Ouvrir le chat"
    >
      <MessageCircle className="w-6 h-6" />
      
      {/* Pulse animation */}
      <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
      
      {/* Unread indicator */}
      {hasUnread && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full border-2 border-background" />
      )}
    </button>
  );
};

export default ChatBubble;
