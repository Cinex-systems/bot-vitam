import { ShoppingCart, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { getTotalItems, toggleCart } = useCart();
  const totalItems = getTotalItems();
  const [isAnimating, setIsAnimating] = useState(false);
  const location = useLocation();

  // Animation du badge quand le nombre change
  useEffect(() => {
    if (totalItems > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Nom du site */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg">🌿</span>
              </div>
              <span className="text-xl font-bold text-foreground">Vitam</span>
            </Link>
            
            {/* Lien vers la démo */}
            <Link
              to="/demo"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/demo'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Démo
            </Link>
          </div>

          {/* Section User */}
          <div className="flex items-center gap-4">
            {/* Icône Client */}
            <button
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Profil client"
            >
              <User className="w-5 h-5 text-gray-600" />
            </button>

            {/* Icône Panier avec badge */}
            <button
              onClick={toggleCart}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Panier"
            >
              <ShoppingCart className="w-5 h-5 text-gray-600" />
              
              {/* Badge avec nombre d'articles */}
              {totalItems > 0 && (
                <span
                  className={`absolute -top-1 -right-1 bg-emerald-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                    isAnimating ? 'animate-ping-once' : ''
                  }`}
                >
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

