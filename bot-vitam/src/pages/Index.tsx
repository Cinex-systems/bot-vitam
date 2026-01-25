import ChatWidget from '@/components/chat/ChatWidget';
import Navbar from '@/components/Navbar';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar />

      {/* Demo page content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <div className="max-w-2xl text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-4xl">🌿</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">
            Bienvenue chez Vitam
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Découvrez nos compléments alimentaires premium, 100% naturels et issus de 
            l'agriculture biologique. Notre expert naturopathe est à votre disposition 
            pour vous conseiller.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-4">
            <span className="px-4 py-2 bg-secondary rounded-full text-sm text-secondary-foreground">
              🍃 Bio certifié
            </span>
            <span className="px-4 py-2 bg-secondary rounded-full text-sm text-secondary-foreground">
              🧪 Formules innovantes
            </span>
            <span className="px-4 py-2 bg-secondary rounded-full text-sm text-secondary-foreground">
              ✨ Haute biodisponibilité
            </span>
          </div>
        </div>
      </div>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
};

export default Index;
