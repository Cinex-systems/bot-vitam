import { Eye, Plus } from 'lucide-react';
import { useState, useRef } from 'react';
import type { Product } from './types';
import { useCart } from '@/contexts/CartContext';
import { FlyToCart } from '@/components/FlyToCart';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProps, setAnimationProps] = useState<{
    startPosition: { x: number; y: number };
    endPosition: { x: number; y: number };
    productImage?: string;
  } | null>(null);
  
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const cartIconRef = useRef<HTMLElement | null>(null);

  // Utiliser link en priorité, sinon productUrl pour la compatibilité
  const link = product.link || product.productUrl || '';
  const image = product.image || '';
  const price = product.price || 'N/C';
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleButtonClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onAddToCart) {
      onAddToCart(product);
    }
    // Le lien s'ouvrira dans un nouvel onglet grâce à target="_blank"
  };

  const handleAddToCartClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Trouver l'icône panier dans la navbar
    const cartIcon = document.querySelector('[aria-label="Panier"]') as HTMLElement;
    if (!cartIcon || !addButtonRef.current) return;

    cartIconRef.current = cartIcon;

    // Obtenir les positions
    const startRect = addButtonRef.current.getBoundingClientRect();
    const endRect = cartIcon.getBoundingClientRect();

    const startPosition = {
      x: startRect.left + startRect.width / 2,
      y: startRect.top + startRect.height / 2,
    };

    const endPosition = {
      x: endRect.left + endRect.width / 2,
      y: endRect.top + endRect.height / 2,
    };

    // Déclencher l'animation
    setIsAnimating(true);
    setAnimationProps({
      startPosition,
      endPosition,
      productImage: image || undefined,
    });

    // Ajouter au panier
    addToCart(product);
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
    setAnimationProps(null);
  };

  const PlaceholderImage = () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <svg 
        className="w-8 h-8 text-gray-300" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1.5} 
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
        />
      </svg>
    </div>
  );

  return (
    <>
      <div className="min-w-[160px] w-40 bg-white rounded-lg border border-gray-100 shadow-sm snap-start flex flex-col overflow-hidden hover:shadow-md transition-shadow flex-shrink-0">
        {/* Image Container - Compact */}
        <div className="h-28 w-full p-2 flex items-center justify-center bg-gray-50 relative">
          {image && !imageError ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                  <PlaceholderImage />
                </div>
              )}
              <img 
                src={image} 
                alt={product.name} 
                className={`h-full w-full object-contain transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(false);
                }}
              />
            </>
          ) : (
            <PlaceholderImage />
          )}
        </div>

        {/* Content Container - Compact */}
        <div className="p-3 flex flex-col flex-grow gap-1">
          {/* Titre - Petit et limité à 2 lignes */}
          <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight h-8">
            {product.name}
          </h3>
          
          {/* Prix - Compact */}
          <div className="mt-1">
            <span className="text-sm font-bold text-emerald-600">
              {price}
            </span>
          </div>

          {/* Boutons - Ligne flex avec deux boutons */}
          <div className="mt-auto flex gap-2">
            {/* Bouton Voir */}
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleButtonClick}
              className="flex-1 bg-slate-900 text-white text-xs text-center py-1.5 rounded-md hover:bg-slate-800 transition-colors flex items-center justify-center gap-1"
            >
              <Eye className="w-3 h-3" />
              <span>Voir</span>
            </a>

            {/* Bouton Ajouter au panier */}
            <button
              ref={addButtonRef}
              onClick={handleAddToCartClick}
              className="w-9 h-[34px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors flex items-center justify-center flex-shrink-0"
              aria-label="Ajouter au panier"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Animation Fly To Cart */}
      {animationProps && (
        <FlyToCart
          startPosition={animationProps.startPosition}
          endPosition={animationProps.endPosition}
          productImage={animationProps.productImage}
          onComplete={handleAnimationComplete}
        />
      )}
    </>
  );
};
