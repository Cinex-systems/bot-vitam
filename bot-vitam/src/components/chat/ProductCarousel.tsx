import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import type { Product } from './types';

interface ProductCarouselProps {
  products: Product[];
  onAddToCart?: (product: Product) => void;
}

const ProductCarousel = ({ products, onAddToCart }: ProductCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    updateScrollButtons();
  }, [products]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(updateScrollButtons, 350);
    }
  };

  return (
    <div className="relative w-full group mt-3">
      {/* Scroll Left Button */}
      <button
        onClick={() => scroll('left')}
        className={`absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-1.5 shadow-md border border-gray-200 hover:bg-gray-50 transition-opacity ${
          canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-label="Faire défiler vers la gauche"
      >
        <ChevronLeft className="w-4 h-4 text-gray-700" />
      </button>

      {/* Products Container - Liste Scrollable */}
      <div
        ref={scrollRef}
        onScroll={updateScrollButtons}
        className="flex overflow-x-auto space-x-3 pb-4 px-4 snap-x snap-mandatory scrollbar-hide"
        style={{ 
          overscrollBehaviorX: 'contain',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {products.map((product, index) => (
          <ProductCard 
            key={product.id || `product-${index}-${product.name}`} 
            product={product} 
            onAddToCart={onAddToCart}
          />
        ))}
      </div>

      {/* Scroll Right Button */}
      <button
        onClick={() => scroll('right')}
        className={`absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-1.5 shadow-md border border-gray-200 hover:bg-gray-50 transition-opacity ${
          canScrollRight && products.length > 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-label="Faire défiler vers la droite"
      >
        <ChevronRight className="w-4 h-4 text-gray-700" />
      </button>
    </div>
  );
};

export default ProductCarousel;
