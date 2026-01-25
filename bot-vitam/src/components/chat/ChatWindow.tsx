import { useEffect, useRef, useState } from 'react';
import { Minus, Send, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import type { ChatMessage as ChatMessageType, Product } from './types';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessageType[];
  isTyping: boolean;
  onSendMessage: (content: string) => void;
  onAddToCart?: (product: Product) => void;
}

const ChatWindow = ({
  isOpen,
  onClose,
  messages,
  isTyping,
  onSendMessage,
  onAddToCart,
}: ChatWindowProps) => {
  const [inputValue, setInputValue] = useState('');
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div
      className={cn(
        'fixed bottom-24 right-6 z-50',
        'w-[380px] h-[520px] max-h-[80vh]',
        'rounded-2xl overflow-hidden',
        'glass shadow-2xl',
        'flex flex-col min-h-0',
        'transition-all duration-300 ease-out origin-bottom-right',
        isOpen
          ? 'opacity-100 scale-100 translate-y-0'
          : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Expert Naturopathe</h3>
            <p className="text-xs opacity-80">Vitam • En ligne</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-primary-foreground hover:bg-primary-foreground/20 rounded-full w-8 h-8"
          aria-label="Réduire le chat"
        >
          <Minus className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div ref={messagesRef} className="flex-1 overflow-y-auto min-h-0 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message} 
              onAddToCart={onAddToCart}
            />
          ))}
          {isTyping && (
            <div className="flex justify-start flex-shrink-0">
              <TypingIndicator />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border/50 bg-background/50 flex-shrink-0">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Posez vos questions à Vitam..."
            className="flex-1 bg-background border-border/50 focus-visible:ring-primary"
            disabled={isTyping}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!inputValue.trim() || isTyping}
            className="bg-primary hover:bg-primary/90 rounded-full w-10 h-10 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
