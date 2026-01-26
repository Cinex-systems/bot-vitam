import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import ChatBubble from './ChatBubble';
import ChatWindow from './ChatWindow';
import type { ChatMessage, Product } from './types';

/**
 * Nettoie une URL qui peut être au format markdown [text](url) ou juste une URL
 */
const cleanUrl = (url: string | undefined): string => {
  if (!url) return '';
  const markdownMatch = url.match(/\[.*?\]\((.*?)\)/);
  if (markdownMatch && markdownMatch[1]) {
    return markdownMatch[1];
  }
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
  
  const sessionIdRef = useRef<string>(
    typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleOpen = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => setIsOpen(false), []);

  const handleSendMessage = useCallback(async (content: string) => {
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
        throw new Error('VITE_N8N_WEBHOOK_URL is not defined');
      }

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

      const rawData = await response.json();
      console.log('Données brutes reçues de n8n:', rawData);

      // --- LOGIQUE DE PARSING INTELLIGENTE ---
      let finalData = Array.isArray(rawData) ? rawData[0] : rawData;

      // 1. Détection : Est-ce que n8n nous a envoyé le JSON sous forme de texte dans un champ 'output' ou 'text' ?
      // C'est souvent le cas avec les agents IA.
      const potentialJsonString = finalData.output || finalData.text || (typeof finalData === 'string' ? finalData : null);

      if (typeof potentialJsonString === 'string' && potentialJsonString.trim().startsWith('{')) {
        try {
          // On essaie de transformer le texte "{ reply: ... }" en objet réel
          const parsedJson = JSON.parse(potentialJsonString.trim());
          // On fusionne pour garder les métadonnées éventuelles
          finalData = { ...finalData, ...parsedJson };
          console.log('JSON interne parsé avec succès:', finalData);
        } catch (e) {
          console.warn("Le texte ressemblait à du JSON mais n'a pas pu être parsé:", e);
        }
      }

      // --- EXTRACTION DES DONNÉES ---
      
      // A. Le Texte (reply)
      let replyText = finalData.reply || finalData.text || finalData.output || "Je n'ai pas compris la réponse.";
      // Si replyText est encore un objet (cas rare), on le force en string
      if (typeof replyText !== 'string') {
         replyText = JSON.stringify(replyText);
      }

      // B. Les Produits (products_cards)
      let productsList: Product[] = [];
      const rawProducts = finalData.products_cards || finalData.products || [];

      if (Array.isArray(rawProducts)) {
        productsList = rawProducts.map((p: any, index: number) => ({
          id: p.id || `prod-${index}-${Date.now()}`,
          // Gestion des noms (Name, Nom, name, ou title)
          name: p.name || p.Name || p.Nom || p.title || 'Produit conseillé',
          // Gestion du prix (Price, Prix, price)
          price: p.price || p.Price || p.Prix,
          // Gestion de l'image
          image: cleanUrl(p.image || p.Image || p.img),
          // Gestion du lien
          link: cleanUrl(p.link || p.Link || p.productUrl || p.url),
          productUrl: cleanUrl(p.link || p.Link || p.productUrl || p.url),
          // Gestion de la description
          description: p.description || p.Description,
          // Gestion des ingrédients (parfois une string, parfois un tableau)
          ingredients: Array.isArray(p.ingredients || p.Ingrédients) 
            ? (p.ingredients || p.Ingrédients) 
            : (p.ingredients || p.Ingrédients ? [p.ingredients || p.Ingrédients] : [])
        }));
      }

      // --- MISE À JOUR DU CHAT ---
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: replyText,
        products: productsList.length > 0 ? productsList : undefined,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error calling n8n API:', error);
      toast.error("Oups, une erreur de communication. Réessayez !");
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
      <ChatWindow
        isOpen={isOpen}
        onClose={handleClose}
        messages={messages}
        isTyping={isTyping}
        onSendMessage={handleSendMessage}
        onAddToCart={handleAddToCart}
      />
      {!isOpen && <ChatBubble onClick={handleOpen} />}
    </>
  );
};

export default ChatWidget;