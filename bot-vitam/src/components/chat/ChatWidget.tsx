import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import ChatBubble from './ChatBubble';
import ChatWindow from './ChatWindow';
import type { ChatMessage, Product } from './types';

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
      if (!webhookUrl) throw new Error('VITE_N8N_WEBHOOK_URL is not defined');

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatInput: content,
          sessionId: sessionIdRef.current
        })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const rawData = await response.json();
      const n8nItem = Array.isArray(rawData) ? rawData[0] : rawData;
      
      console.log('--- RÉCEPTION N8N ---', n8nItem);

      // --- LOGIQUE DE DÉCODAGE RENFORCÉE ---
      
      let finalReplyText = "";
      let finalProducts: any[] = [];

      // CAS 1 : Format direct avec reply et products_cards (format actuel de n8n)
      if (n8nItem.reply && typeof n8nItem.reply === 'string') {
        console.log('✅ Format direct détecté (reply + products_cards)');
        finalReplyText = n8nItem.reply;
        finalProducts = n8nItem.products_cards || [];
      }
      // CAS 2 : Format avec texte dans output/text qui contient du JSON stringifié
      else {
        // 1. Chercher le texte brut renvoyé par l'IA (souvent dans 'output' ou 'text')
        const aiString = n8nItem.output || n8nItem.text || (typeof n8nItem === 'string' ? n8nItem : "");

        let parsedAiJson = null;

        // 2. Essayer de parser ce texte si ça ressemble à du JSON
        if (typeof aiString === 'string' && aiString.trim().startsWith('{')) {
          try {
              // Nettoyage préventif (au cas où il y a du markdown ```json autour)
              const cleanString = aiString.replace(/```json/g, '').replace(/```/g, '').trim();
              parsedAiJson = JSON.parse(cleanString);
              console.log('✅ JSON IA détecté et parsé :', parsedAiJson);
          } catch (e) {
              console.warn('⚠️ Échec du parsing JSON IA', e);
          }
        }

        // 3. PRISE DE DÉCISION (Le Juge)
        if (parsedAiJson && parsedAiJson.reply) {
            // CAS A : L'IA a bien renvoyé notre format JSON strict
            finalReplyText = parsedAiJson.reply;
            finalProducts = parsedAiJson.products_cards || [];
        } else {
            // CAS B : L'IA a répondu en texte normal (ou le parsing a échoué)
            finalReplyText = aiString;
            // Et on prend les produits trouvés par n8n (le fallback)
            finalProducts = n8nItem.products || n8nItem.products_cards || [];
        }
      }

      // 4. MAPPING DES PRODUITS (Standardisation)
      const mappedProducts: Product[] = finalProducts.map((p: any, index: number) => ({
        id: p.id || `prod-${index}-${Date.now()}`,
        name: p.name || p.Name || p.Nom || p.title || 'Produit conseillé',
        // Nettoyage du prix (parfois l'IA met "17,90 €", parfois 17.90)
        price: p.price || p.Price || p.Prix,
        image: cleanUrl(p.image || p.Image || p.img),
        link: cleanUrl(p.link || p.Link || p.productUrl || p.url),
        productUrl: cleanUrl(p.link || p.Link || p.productUrl || p.url),
        description: p.description || p.Description,
        ingredients: Array.isArray(p.ingredients || p.Ingrédients) 
          ? (p.ingredients || p.Ingrédients) 
          : (p.ingredients || p.Ingrédients ? [p.ingredients || p.Ingrédients] : [])
      }));

      console.log('📝 Texte final :', finalReplyText);
      console.log('📏 Longueur du texte :', finalReplyText.length);
      console.log('🛒 Produits finaux :', mappedProducts);

      // Vérification que le texte n'est pas vide
      if (!finalReplyText || finalReplyText.trim().length === 0) {
        console.warn('⚠️ ATTENTION : Le texte de réponse est vide !');
        console.warn('Données reçues complètes:', n8nItem);
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: finalReplyText || 'Désolé, je n\'ai pas pu générer de réponse.',
        products: mappedProducts.length > 0 ? mappedProducts : undefined,
        timestamp: new Date(),
      };
      
      console.log('💬 Message assistant créé :', {
        content: assistantMessage.content,
        contentLength: assistantMessage.content.length,
        hasProducts: !!assistantMessage.products,
        productsCount: assistantMessage.products?.length || 0
      });
      
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error calling n8n API:', error);
      toast.error("Problème de connexion au cerveau du robot.");
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