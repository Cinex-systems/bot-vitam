import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User } from 'lucide-react';
import type { ChatMessage as ChatMessageType, Product } from './types';
import ProductCarousel from './ProductCarousel';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: ChatMessageType;
  onAddToCart?: (product: Product) => void;
}

const ChatMessage = ({ message, onAddToCart }: ChatMessageProps) => {
  const isBot = message.role === 'assistant';

  // Fonction de rendu sécurisé pour éviter les crashs
  const safeRender = (children: React.ReactNode) => {
      return children;
  };

  return (
    <div
      className={cn(
        "flex w-full gap-3 p-4",
        isBot ? "bg-white" : "bg-emerald-50/50 flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        isBot ? "bg-emerald-100 text-emerald-600" : "bg-emerald-600 text-white"
      )}>
        {isBot ? <Bot size={18} /> : <User size={18} />}
      </div>

      {/* Contenu du message */}
      <div className={cn("flex-1 space-y-4", !isBot && "text-right")}>
        
        {/* 1. LE TEXTE (Important : on vérifie qu'il n'est pas vide) */}
        {message.content && (
          <div className={cn("prose prose-sm max-w-none", !isBot && "ml-auto")}>
             <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0 text-[13px] leading-relaxed text-gray-800">{safeRender(children)}</p>,
                strong: ({ children }) => <span className="font-semibold text-emerald-700">{safeRender(children)}</span>,
                ul: ({ children }) => <ul className="list-disc pl-4 my-1 space-y-1">{safeRender(children)}</ul>,
                li: ({ children }) => <li className="text-[13px] leading-snug pl-1">{safeRender(children)}</li>,
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener" className="text-blue-600 hover:underline text-[12px]">
                    {safeRender(children)}
                  </a>
                )
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* 2. LES PRODUITS (Carousel) */}
        {message.products && message.products.length > 0 && (
          <div className={cn("mt-3", !isBot && "flex justify-end")}>
            <div className="max-w-[280px] w-full">
              <ProductCarousel products={message.products} onAddToCart={onAddToCart} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;