import React from 'react';
import ReactMarkdown from 'react-markdown';
import ProductCarousel from './ProductCarousel';

// Helper pour sécuriser les children - convertit tout en éléments valides
const safeRender = (children: React.ReactNode): React.ReactNode => {
  if (children == null) return null;
  if (typeof children === 'string' || typeof children === 'number') return children;
  if (Array.isArray(children)) {
    return children.map((child, i) => {
      if (typeof child === 'string' || typeof child === 'number') return child;
      if (React.isValidElement(child)) return child;
      return String(child);
    });
  }
  if (React.isValidElement(children)) return children;
  // Si c'est un objet complexe, on le convertit en string
  return String(children);
};

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
             <ReactMarkdown
               components={{
                 // P: Texte plus petit (text-[13px]) et moins espacé
                 p: ({ children }) => <p className="mb-1 last:mb-0 text-[13px] leading-snug text-gray-700">{safeRender(children)}</p>,
                 
                 // STRONG: Gras mais pas trop agressif
                 strong: ({ children }) => <span className="font-semibold text-emerald-700">{safeRender(children)}</span>,
                 
                 // UL: Marges réduites
                 ul: ({ children }) => <ul className="list-disc pl-4 my-1 space-y-0.5">{safeRender(children)}</ul>,
                 
                 // LI: Texte compact
                 li: ({ children }) => <li className="text-[13px] leading-snug">{safeRender(children)}</li>,
                 
                 // H3: Titres beaucoup plus petits (avant c'était text-lg)
                 h3: ({ children }) => <h3 className="font-bold text-sm mt-3 mb-1 text-gray-900">{safeRender(children)}</h3>,
                 
                 // Liens
                 a: ({ href, children }) => (
                   <a href={href} target="_blank" rel="noopener" className="text-blue-500 hover:text-blue-600 underline text-[13px]">
                     {safeRender(children)}
                   </a>
                 )
               }}
             >
               {content}
             </ReactMarkdown>
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
