import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import ChatBubble from './ChatBubble';
import ChatWindow from './ChatWindow';
import type { ChatMessage, Product } from './types';

/**
 * Nettoie une URL qui peut être au format markdown [text](url) ou juste une URL
 * @param url - L'URL potentiellement formatée en markdown
 * @returns L'URL nettoyée
 */
const cleanUrl = (url: string | undefined): string => {
  if (!url) return '';
  
  // Si c'est au format markdown [text](url), extraire l'URL
  const markdownMatch = url.match(/\[.*?\]\((.*?)\)/);
  if (markdownMatch && markdownMatch[1]) {
    return markdownMatch[1];
  }
  
  // Sinon retourner l'URL telle quelle
  return url;
};

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: "Bonjour, je suis votre expert naturopathe. Comment puis-je vous aider aujourd'hui ?",
  timestamp: new Date(),
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  // Generate unique sessionId on component mount
  const sessionIdRef = useRef<string>(
    typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  );

  // Auto-open chat after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSendMessage = useCallback(async (content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
      
      if (!webhookUrl) {
        console.error('❌ ERREUR: La variable d\'environnement VITE_N8N_WEBHOOK_URL n\'est pas définie.');
        console.error('Veuillez ajouter VITE_N8N_WEBHOOK_URL dans votre fichier .env.local');
        throw new Error('VITE_N8N_WEBHOOK_URL is not defined');
      }

      console.log('URL Webhook utilisée:', webhookUrl);
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatInput: content,
          sessionId: sessionIdRef.current
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Données reçues de n8n:', data); // Pour le debug
      
      // Gérer le nouveau format avec reply/text et products_cards
      let replyText: string;
      let productsList: Product[] = [];
      
      // Normaliser les données (gérer le cas où c'est un tableau)
      const rawData = Array.isArray(data) ? data[0] : data;
      
      // Vérifier si products_cards existe (nouveau format)
      if (rawData.products_cards && Array.isArray(rawData.products_cards)) {
        // Nouveau format avec products_cards
        const replyTextRaw = rawData.reply || rawData.text || rawData.output || "Désolé, je n'ai pas pu récupérer de texte.";
        replyText = typeof replyTextRaw === 'string' ? replyTextRaw : String(replyTextRaw || "Désolé, je n'ai pas pu récupérer de texte.");
        
        console.log('Format détecté: nouveau format avec products_cards');
        console.log('Nombre de produits reçus:', rawData.products_cards.length);
        
        // Transformer products_cards en format Product
        productsList = rawData.products_cards.map((product: any, index: number) => {
          const mappedProduct = {
            id: product.id || `product-${Date.now()}-${index}`,
            name: product.name || 'Produit sans nom',
            price: product.price || undefined, // Peut être une string comme "17,90 €"
            image: cleanUrl(product.image),
            link: cleanUrl(product.link),
            description: product.description,
            // Pour compatibilité avec l'ancien format
            productUrl: cleanUrl(product.link) || cleanUrl(product.productUrl),
            ingredients: product.ingredients || [],
          };
          console.log(`Produit ${index + 1} mappé:`, mappedProduct);
          return mappedProduct;
        });
      } else {
        // Format ancien (rétrocompatibilité) - cherche dans products
        const replyTextRaw = rawData.reply || rawData.output || rawData.text || "Désolé, je n'ai pas pu récupérer de texte.";
        replyText = typeof replyTextRaw === 'string' ? replyTextRaw : String(replyTextRaw || "Désolé, je n'ai pas pu récupérer de texte.");
        
        // Gérer les produits de l'ancien format
        const oldProducts = Array.isArray(rawData.products) ? rawData.products : [];
        productsList = oldProducts.map((product: any, index: number) => ({
          id: product.id || `product-${Date.now()}-${index}`,
          name: product.name || 'Produit sans nom',
          price: product.price || undefined,
          image: cleanUrl(product.image),
          link: cleanUrl(product.link) || cleanUrl(product.productUrl),
          productUrl: cleanUrl(product.productUrl) || cleanUrl(product.link),
          ingredients: product.ingredients || [],
        }));
      }

      console.log('replyText (type:', typeof replyText, '):', replyText);
      console.log('productsList:', productsList);

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: replyText,
        products: productsList.length > 0 ? productsList : undefined,
        timestamp: new Date(),
      };
      
      setMessages(prev => {
        const newMessages = [...prev, assistantMessage];
        console.log('Nouveau message assistant ajouté:', assistantMessage);
        console.log('Nombre total de messages:', newMessages.length);
        return newMessages;
      });
    } catch (error) {
      console.error('Error calling n8n API:', error);
      toast.error("Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setIsTyping(false);
    }
  }, []);

  const handleAddToCart = useCallback((product: Product) => {
    toast.success(`${product.name} ajouté au panier !`, {
      description: 'Consultez votre panier pour finaliser votre commande.',
    });
  }, []);

  return (
    <>
      {/* Chat Window */}
      <ChatWindow
        isOpen={isOpen}
        onClose={handleClose}
        messages={messages}
        isTyping={isTyping}
        onSendMessage={handleSendMessage}
        onAddToCart={handleAddToCart}
      />

      {/* Floating Bubble (visible when chat is closed) */}
      {!isOpen && <ChatBubble onClick={handleOpen} />}
    </>
  );
};

export default ChatWidget;
