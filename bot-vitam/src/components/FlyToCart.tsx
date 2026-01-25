import { useEffect, useRef, useState } from 'react';

interface FlyToCartProps {
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  onComplete: () => void;
  productImage?: string;
}

export const FlyToCart = ({ startPosition, endPosition, onComplete, productImage }: FlyToCartProps) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(startPosition);
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (!elementRef.current) return;

    const duration = 600;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Courbe de Bézier pour un mouvement fluide
      const easeInOutCubic = (t: number) => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };

      const easedProgress = easeInOutCubic(progress);

      // Calculer la position avec une courbe (arc)
      const currentX = startPosition.x + (endPosition.x - startPosition.x) * easedProgress;
      const currentY = startPosition.y + (endPosition.y - startPosition.y) * easedProgress;
      
      // Ajouter un arc (courbe vers le haut au milieu)
      const arcHeight = 50;
      const arcY = currentY - Math.sin(progress * Math.PI) * arcHeight;

      // Scale et opacity
      const currentScale = progress < 0.5 
        ? 1 + (progress * 0.4) // Agrandir jusqu'à 1.4
        : 1.4 - ((progress - 0.5) * 2.2); // Rétrécir jusqu'à 0.3
      const currentOpacity = 1 - progress * 0.7; // Disparaître progressivement

      setPosition({ x: currentX, y: arcY });
      setScale(currentScale);
      setOpacity(currentOpacity);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    // Petit délai pour que le DOM soit prêt
    requestAnimationFrame(() => {
      requestAnimationFrame(animate);
    });
  }, [startPosition, endPosition, onComplete]);

  const style: React.CSSProperties = {
    position: 'fixed',
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: '40px',
    height: '40px',
    zIndex: 9999,
    pointerEvents: 'none',
    transform: `translate(-50%, -50%) scale(${scale})`,
    opacity: opacity,
    transition: 'none', // Désactiver les transitions CSS pour utiliser JS
  };

  return (
    <div ref={elementRef} style={style}>
      {productImage ? (
        <img
          src={productImage}
          alt=""
          className="w-full h-full object-contain rounded-full border-2 border-emerald-600 bg-white p-1 shadow-lg"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
          +
        </div>
      )}
    </div>
  );
};
