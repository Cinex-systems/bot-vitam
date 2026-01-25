import { X, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useEffect, useState } from 'react';

const CartDrawer = () => {
  const { 
    items, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    getTotalPrice 
  } = useCart();

  const [isVisible, setIsVisible] = useState(false);
  const totalPrice = getTotalPrice();

  // Gérer l'animation d'ouverture/fermeture
  useEffect(() => {
    if (isCartOpen) {
      // Petit délai pour déclencher l'animation
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
    }
  }, [isCartOpen]);

  // Empêcher le scroll du body quand le drawer est ouvert
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen && !isVisible) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const handleCheckout = () => {
    alert('Vers le checkout...');
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full md:w-[400px] bg-white shadow-xl z-50 flex flex-col transform transition-transform duration-300 ease-out ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">Mon Panier</h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Fermer le panier"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Liste des Produits - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-600 mb-2">
                Votre panier est vide
              </p>
              <p className="text-sm text-gray-500">
                Ajoutez des produits depuis le chat pour commencer
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const itemPrice = parseFloat(
                  item.price?.replace(/[^\d,.-]/g, '').replace(',', '.') || '0'
                );

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {/* Image */}
                    <div className="flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 object-contain bg-white rounded border border-gray-200 p-1"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Infos produit */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate mb-1">
                        {item.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-emerald-600 font-bold">
                            {item.price}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-gray-500">
                              Quantité: {item.quantity}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id || '')}
                          className="p-2 rounded-lg hover:bg-red-100 transition-colors text-red-600"
                          aria-label={`Supprimer ${item.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer - Fixe en bas */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-6 flex-shrink-0 bg-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-emerald-600">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg"
            >
              Commander
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;

