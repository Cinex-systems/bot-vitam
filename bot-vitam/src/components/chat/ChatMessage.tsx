import React from 'react';
import ReactMarkdown from 'react-markdown';
import ProductCarousel from './ProductCarousel'; 

export const ChatMessage = ({ message, onAddToCart }: any) => {
  const isAssistant = message.role === 'assistant';
  const content = typeof message.content === 'string' ? message.content : (message.text || '');

  return (
    <div className={`flex w-full flex-col mb-6 ${isAssistant ? 'items-start' : 'items-end'}`}>
      <div className={`max-w-[90%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
          isAssistant ? 'bg-white text-gray-800' : 'bg-emerald-600 text-white'
        }`}>
        {isAssistant ? (
          <div className="markdown-body">
             {/* Test minimaliste */}
             <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{content}</p>
        )}
      </div>
      
      {/* Réactivation du carousel */}
      {isAssistant && message.products && (
         <div className="mt-3 w-full"><ProductCarousel products={message.products} onAddToCart={onAddToCart} /></div>
      )}
    </div>
  );
};
export default ChatMessage;
