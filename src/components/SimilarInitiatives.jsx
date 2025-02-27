
import { useState, useEffect } from 'react';
import Card from './Card.jsx';

export default function SimilarInitiatives({ currentInitiative, allInitiatives, language }) {
  const [similarInitiatives, setSimilarInitiatives] = useState([]);
  const [isClient, setIsClient] = useState(false);

  // Exécuter le filtrage uniquement côté client
  useEffect(() => {
    setIsClient(true);
    
    if (currentInitiative && allInitiatives && allInitiatives.length > 0) {
      // Filtrer pour exclure l'initiative courante et trouver des initiatives similaires
      const filtered = allInitiatives.filter(initiative => {
        // Exclure l'initiative actuelle
        if (initiative.title === currentInitiative["Nom de l'initiative"]) {
          return false;
        }
        
        // Chercher par pays ou catégorie similaire
        return initiative.country === currentInitiative.Pays || 
               initiative.category === currentInitiative["Catégorie de l'initiative"];
      });
      
      // Limiter à 3 initiatives similaires maximum
      setSimilarInitiatives(filtered.slice(0, 3));
    }
  }, [currentInitiative, allInitiatives]);

  // Si nous sommes côté serveur ou si nous n'avons pas d'initiatives similaires, ne rien afficher
  if (!isClient || similarInitiatives.length === 0) {
    return null;
  }

  const titleText = language === 'fr' ? 'Initiatives similaires' : 'Similar Initiatives';

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-center mb-8">{titleText}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        {similarInitiatives.map((initiative, index) => (
          <Card
            key={`similar-${index}-${initiative.title}`}
            title={initiative.title}
            country={initiative.country}
            category={initiative.category}
            description={initiative.description}
            language={language}
          />
        ))}
      </div>
    </div>
  );
}
