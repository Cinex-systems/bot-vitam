import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import ChatWidget from '@/components/chat/ChatWidget';
import Navbar from '@/components/Navbar';

const DEMO_URL = 'https://www.dynveo.fr';
// Plusieurs proxies CORS publics en fallback
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://api.codetabs.com/v1/proxy?quest=',
];

// Fonction pour convertir les URLs relatives en absolues
const convertToAbsoluteUrl = (url: string, baseUrl: string): string => {
  if (!url || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
    return url;
  }
  if (url.startsWith('/')) {
    try {
      const base = new URL(baseUrl);
      return `${base.origin}${url}`;
    } catch {
      return url;
    }
  }
  try {
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
};

// Fonction pour traiter le HTML et intercepter les clics
const processHtml = (html: string, baseUrl: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Convertir toutes les URLs relatives en absolues
  // Images
  doc.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src');
    if (src) img.setAttribute('src', convertToAbsoluteUrl(src, baseUrl));
    const srcset = img.getAttribute('srcset');
    if (srcset) {
      img.setAttribute('srcset', srcset.split(',').map((item) => {
        const parts = item.trim().split(' ');
        return parts[0] ? `${convertToAbsoluteUrl(parts[0], baseUrl)} ${parts.slice(1).join(' ')}` : item;
      }).join(', '));
    }
  });
  
  // CSS
  doc.querySelectorAll('link[rel="stylesheet"], link[rel="preload"], link[rel="icon"]').forEach((link) => {
    const href = link.getAttribute('href');
    if (href) link.setAttribute('href', convertToAbsoluteUrl(href, baseUrl));
  });
  
  // Scripts
  doc.querySelectorAll('script[src]').forEach((script) => {
    const src = script.getAttribute('src');
    if (src) script.setAttribute('src', convertToAbsoluteUrl(src, baseUrl));
  });
  
  // Modifier tous les liens pour intercepter les clics (on utilisera des data-attributes)
  doc.querySelectorAll('a').forEach((anchor) => {
    const href = anchor.getAttribute('href');
    if (href && !href.startsWith('javascript:') && !href.startsWith('#')) {
      anchor.setAttribute('href', '#');
      anchor.setAttribute('data-demo-href', href);
      anchor.setAttribute('data-demo-text', anchor.textContent || '');
      anchor.classList.add('demo-link');
    }
  });
  
  // Modifier tous les formulaires
  doc.querySelectorAll('form').forEach((form) => {
    form.classList.add('demo-form');
  });
  
  // Modifier tous les boutons submit
  doc.querySelectorAll('button[type="submit"], input[type="submit"]').forEach((button) => {
    button.classList.add('demo-submit');
    button.setAttribute('data-demo-text', (button.textContent || (button as HTMLInputElement).value || 'Bouton'));
  });
  
  return doc.documentElement.outerHTML;
};

const Demo = () => {
  const [loading, setLoading] = useState(true);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intercepter les clics après l'injection du HTML
  useEffect(() => {
    if (!htmlContent || !containerRef.current) return;

    const container = containerRef.current;

    const handleLinkClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a.demo-link') as HTMLAnchorElement;
      if (link) {
        e.preventDefault();
        e.stopPropagation();
        const href = link.getAttribute('data-demo-href') || '';
        const text = link.getAttribute('data-demo-text') || '';
        console.log('🔗 Lien cliqué:', href);
        toast.info('Simulé : Produit ajouté au panier via le Chatbot', {
          description: `Lien: ${href}`,
          duration: 4000,
        });
      }
    };

    const handleFormSubmit = (e: Event) => {
      const target = e.target as HTMLElement;
      const form = target.closest('form.demo-form') as HTMLFormElement;
      if (form) {
        e.preventDefault();
        e.stopPropagation();
        console.log('📝 Formulaire soumis');
        toast.info('Simulé : Produit ajouté au panier via le Chatbot', {
          description: 'Formulaire intercepté',
          duration: 4000,
        });
      }
    };

    const handleButtonClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button.demo-submit, input.demo-submit') as HTMLButtonElement | HTMLInputElement;
      if (button) {
        e.preventDefault();
        e.stopPropagation();
        const text = button.getAttribute('data-demo-text') || '';
        console.log('🔘 Bouton cliqué:', text);
        toast.info('Simulé : Produit ajouté au panier via le Chatbot', {
          description: `Bouton: ${text}`,
          duration: 4000,
        });
      }
    };

    // Utiliser la délégation d'événements sur le conteneur
    container.addEventListener('click', handleLinkClick, true);
    container.addEventListener('click', handleButtonClick, true);
    container.addEventListener('submit', handleFormSubmit, true);

    console.log('👂 Écoute des clics activée');

    return () => {
      container.removeEventListener('click', handleLinkClick, true);
      container.removeEventListener('click', handleButtonClick, true);
      container.removeEventListener('submit', handleFormSubmit, true);
    };
  }, [htmlContent]);

  // Récupérer le HTML via proxy CORS
  useEffect(() => {
    const fetchHtml = async () => {
      setLoading(true);
      setError(null);
      
      // Essayer chaque proxy jusqu'à ce qu'un fonctionne
      for (let i = 0; i < CORS_PROXIES.length; i++) {
        try {
          const proxy = CORS_PROXIES[i];
          const proxyUrl = `${proxy}${encodeURIComponent(DEMO_URL)}`;
          console.log(`🔄 Tentative ${i + 1}/${CORS_PROXIES.length} avec proxy: ${proxy}`);
          
          const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          const html = await response.text();
          console.log('✅ HTML récupéré, longueur:', html.length);
          
          if (html.length < 100) {
            throw new Error('HTML trop court, probablement une erreur');
          }
          
          const processedHtml = processHtml(html, DEMO_URL);
          console.log('✅ HTML traité avec succès');
          
          setHtmlContent(processedHtml);
          setLoading(false);
          return; // Succès, on sort de la boucle
        } catch (err) {
          console.warn(`⚠️ Proxy ${i + 1} a échoué:`, err);
          if (i === CORS_PROXIES.length - 1) {
            // Dernier proxy, on affiche l'erreur
            setError('Impossible de charger le site Dynveo. Tous les proxies CORS ont échoué.');
            setLoading(false);
            toast.error('Impossible de charger le site Dynveo. Vérifiez votre connexion internet.');
          }
        }
      }
    };

    fetchHtml();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Bannière d'information */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Mode Démo :</span> Le site Dynveo est chargé dans un iframe. Les interactions sont interceptées pour simuler l'ajout au panier via le chatbot.
          </p>
          {htmlContent && (
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
              Site chargé
            </span>
          )}
          {error && (
            <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
              Erreur
            </span>
          )}
        </div>
      </div>
      
      <div className="relative w-full" style={{ height: 'calc(100vh - 64px - 40px)' }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Chargement de la démo...</p>
              <p className="text-xs text-muted-foreground">Récupération du contenu depuis dynveo.fr...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="text-center space-y-4 max-w-md px-4">
              <div className="text-red-500 text-4xl">⚠️</div>
              <p className="text-red-600 font-semibold">Erreur de chargement</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}
        
        {htmlContent && (
          <div
            ref={containerRef}
            className="w-full h-full overflow-auto bg-white"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )}
        
        {/* ChatWidget toujours visible par-dessus */}
        <div className="fixed bottom-4 right-4 z-50">
          <ChatWidget />
        </div>
      </div>
    </div>
  );
};

export default Demo;

