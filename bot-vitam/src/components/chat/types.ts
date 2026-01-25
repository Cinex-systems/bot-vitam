export interface Product {
  id?: string; // Optionnel car peut être généré
  name: string;
  image?: string;
  ingredients?: string[]; // Optionnel pour le nouveau format
  productUrl?: string; // Optionnel, on utilise 'link' en priorité
  link?: string; // Nouveau format depuis n8n
  price?: string;
  description?: string; // Nouveau champ depuis n8n
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: Product[];
  timestamp: Date;
}

export interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  isOpen: boolean;
}
