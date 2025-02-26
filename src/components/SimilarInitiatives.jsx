
import { useState, useEffect } from 'react';
import Card from './Card';

const SimilarInitiatives = ({ currentInitiative, allInitiatives, language }) => {
  const [similarInitiatives, setSimilarInitiatives] = useState([]);

  useEffect(() => {
    const getSimilarInitiatives = () => {
      if (!allInitiatives || !currentInitiative) {
        return [];
      }

      // Filtrer les initiatives ne correspondant pas à celle en cours
      const filteredInitiatives = allInitiatives.filter(initiative => 
        initiative.title !== currentInitiative.title
      );

      // Trier par catégorie puis par pays
      const withScores = filteredInitiatives.map(initiative => {
        let score = 0;
        
        // Score plus élevé pour la même catégorie
        if (initiative.category === currentInitiative.category) {
          score += 3;
        }
        
        // Score additionnel pour le même pays
        if (initiative.country === currentInitiative.country) {
          score += 2;
        }

        // Score additionnel pour la même thématique
        if (initiative.thematic === currentInitiative.thematic) {
          score += 1;
        }

        return { ...initiative, score };
      });

      // Trier par score décroissant et prendre les 6 premiers
      return withScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);
    };

    setSimilarInitiatives(getSimilarInitiatives());
  }, [currentInitiative, allInitiatives]);

  if (!similarInitiatives.length) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">
        {language === 'fr' ? 'Initiatives similaires' : 'Similar initiatives'}
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {similarInitiatives.map((initiative) => (
          <Card
            key={initiative.title}
            title={initiative.title}
            country={initiative.country}
            category={initiative.category}
            description={initiative.thematic}
            langue={initiative.langue}
          />
        ))}
      </div>
    </div>
  );
};

export default SimilarInitiatives;
