
import { useMemo } from 'react';
import Card from './Card';

const SimilarInitiatives = ({ currentInitiative, allInitiatives, language }) => {
  const similarInitiatives = useMemo(() => {
    // Filtrer l'initiative courante
    const otherInitiatives = allInitiatives.filter(
      (initiative) => initiative.title !== currentInitiative.title
    );

    // Trouver les initiatives de la même catégorie
    const sameCategory = otherInitiatives
      .filter((initiative) => initiative.category === currentInitiative.category)
      .slice(0, 3);

    // Trouver les initiatives du même pays
    const sameCountry = otherInitiatives
      .filter(
        (initiative) =>
          initiative.country === currentInitiative.country &&
          !sameCategory.includes(initiative)
      )
      .slice(0, 3);

    // Si on n'a pas assez d'initiatives, compléter avec des initiatives aléatoires
    const remaining = 6 - (sameCategory.length + sameCountry.length);
    let random = [];
    if (remaining > 0) {
      random = otherInitiatives
        .filter(
          (initiative) =>
            !sameCategory.includes(initiative) && !sameCountry.includes(initiative)
        )
        .sort(() => Math.random() - 0.5)
        .slice(0, remaining);
    }

    return [...sameCategory, ...sameCountry, ...random];
  }, [currentInitiative, allInitiatives]);

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
