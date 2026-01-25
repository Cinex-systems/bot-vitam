import type { Product } from './types';

// Simulated products
const mockProducts: Product[] = [
  {
    id: 'curcumine-001',
    name: 'Curcumine Bio Liposomale',
    image: '',
    ingredients: ['Curcuma longa', 'Pipérine', 'Phospholipides de tournesol'],
    productUrl: 'https://dynveo.fr/curcumine',
    price: '29,90 €',
  },
  {
    id: 'charbon-002',
    name: 'Charbon Végétal Activé',
    image: '',
    ingredients: ['Charbon de coco activé', 'Argile verte', 'Fenouil bio'],
    productUrl: 'https://dynveo.fr/charbon',
    price: '18,50 €',
  },
];

// Simulated responses
const responses: Record<string, { text: string; products?: Product[] }> = {
  default: {
    text: "Je suis là pour vous conseiller sur nos compléments alimentaires naturels. Que recherchez-vous aujourd'hui ?",
  },
  curcuma: {
    text: "Excellent choix ! La curcumine est reconnue pour ses propriétés anti-inflammatoires et antioxydantes. Notre formule liposomale offre une biodisponibilité optimale. Voici notre produit phare :",
    products: [mockProducts[0]],
  },
  digestion: {
    text: "Pour les troubles digestifs, je vous recommande notre Charbon Végétal Activé. Il aide à réduire les ballonnements et favorise le confort intestinal. Le voici :",
    products: [mockProducts[1]],
  },
  produits: {
    text: "Voici nos deux best-sellers pour commencer. La Curcumine pour l'inflammation et les articulations, et le Charbon pour la digestion :",
    products: mockProducts,
  },
  bonjour: {
    text: "Bonjour ! 👋 Je suis votre conseiller Vitam. Comment puis-je vous aider à prendre soin de votre santé naturellement ?",
  },
  merci: {
    text: "Je vous en prie ! N'hésitez pas si vous avez d'autres questions sur nos compléments alimentaires. Votre bien-être est notre priorité. 🌿",
  },
};

// Find matching response based on keywords
function findResponse(message: string): { text: string; products?: Product[] } {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('curcum') || lowerMessage.includes('inflammation') || lowerMessage.includes('articulation')) {
    return responses.curcuma;
  }
  if (lowerMessage.includes('charbon') || lowerMessage.includes('digest') || lowerMessage.includes('ballonnement') || lowerMessage.includes('ventre')) {
    return responses.digestion;
  }
  if (lowerMessage.includes('produit') || lowerMessage.includes('catalogue') || lowerMessage.includes('recommand') || lowerMessage.includes('quoi prendre')) {
    return responses.produits;
  }
  if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut') || lowerMessage.includes('hello')) {
    return responses.bonjour;
  }
  if (lowerMessage.includes('merci') || lowerMessage.includes('super') || lowerMessage.includes('parfait')) {
    return responses.merci;
  }
  
  return responses.default;
}

// Simulate API call with delay
export async function simulateChatResponse(userMessage: string): Promise<{ text: string; products?: Product[] }> {
  // Simulate network delay (1-2 seconds)
  const delay = 1000 + Math.random() * 1000;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  return findResponse(userMessage);
}
