import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Product } from '@/components/chat/types';

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setIsCartOpen: (isOpen: boolean) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = useCallback((product: Product) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      
      if (existingItem) {
        // Si le produit existe déjà, incrémenter la quantité
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Sinon, ajouter le produit avec une quantité de 1
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => {
      const price = parseFloat(item.price?.replace(/[^\d,.-]/g, '').replace(',', '.') || '0');
      return total + price * item.quantity;
    }, 0);
  }, [items]);

  const toggleCart = useCallback(() => {
    setIsCartOpen((prev) => !prev);
  }, []);

  const handleSetIsCartOpen = useCallback((isOpen: boolean) => {
    setIsCartOpen(isOpen);
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        isCartOpen,
        addToCart,
        removeFromCart,
        clearCart,
        toggleCart,
        setIsCartOpen: handleSetIsCartOpen,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

