import { useMemo } from "react";
import Card from "./Card";
import PrimaryCTA from "../components/ui/buttons/PrimaryCTA.astro";
import { slug } from "@/utils/slug";

const SimilarInitiatives = ({
  currentInitiative,
  allInitiatives,
  language,
}) => {
  const similarInitiatives = useMemo(() => {
    // Filtrer l'initiative courante
    const otherInitiatives = allInitiatives.filter(
      (initiative) => initiative.title !== currentInitiative.title,
    );

    // Trouver les initiatives de la même catégorie
    const sameCategory = otherInitiatives
      .filter(
        (initiative) => initiative.category === currentInitiative.category,
      )
      .slice(0, 3);

    // Trouver les initiatives du même pays
    const sameCountry = otherInitiatives
      .filter(
        (initiative) =>
          initiative.country === currentInitiative.country &&
          !sameCategory.includes(initiative),
      )
      .slice(0, 3);

    // Si on n'a pas assez d'initiatives, compléter avec des initiatives aléatoires
    const remaining = 6 - (sameCategory.length + sameCountry.length);
    let random = [];
    if (remaining > 0) {
      random = otherInitiatives
        .filter(
          (initiative) =>
            !sameCategory.includes(initiative) &&
            !sameCountry.includes(initiative),
        )
        .sort(() => Math.random() - 0.5)
        .slice(0, remaining);
    }

    const initiatives = [...sameCategory];
    Array.prototype.push.apply(initiatives, sameCountry);
    Array.prototype.push.apply(initiatives, random);
    return initiatives;
  }, [allInitiatives, currentInitiative]); // Ajout des dépendances manquantes

  // Trouver l'index de l'initiative actuelle dans le tableau de toutes les initiatives
  const currentIndex = allInitiatives.findIndex(
    (initiative) => initiative.title === currentInitiative.title,
  );

  // Déterminer les initiatives précédente et suivante dans la même catégorie
  const getCategoryNavigation = () => {
    // Filtrer les initiatives de la même catégorie
    const categoryInitiatives = allInitiatives.filter(
      (initiative) => initiative.category === currentInitiative.category,
    );

    // Trouver l'index de l'initiative actuelle dans cette catégorie
    const indexInCategory = categoryInitiatives.findIndex(
      (initiative) => initiative.title === currentInitiative.title,
    );

    // Déterminer les initiatives précédente et suivante
    return {
      prev:
        indexInCategory > 0 ? categoryInitiatives[indexInCategory - 1] : null,
      next:
        indexInCategory < categoryInitiatives.length - 1
          ? categoryInitiatives[indexInCategory + 1]
          : null,
    };
  };

  const { prev, next } = getCategoryNavigation();

  return (
    <div className="mt-12">
      {/* Boutons de navigation Précédent/Suivant */}
      <div className="mb-8 flex justify-between">
        {prev ? (
          <PrimaryCTA
            title={
              language === "fr"
                ? "Initiative précédente"
                : "Previous initiative"
            }
            url={
              language === "fr"
                ? `/fr/initiatives/${slug(prev.title)}`
                : `/initiatives/${slug(prev.title)}`
            }
          />
        ) : (
          <div></div> // Espace vide pour maintenir l'alignement
        )}

        {next ? (
          <PrimaryCTA
            title={
              language === "fr" ? "Initiative suivante" : "Next initiative"
            }
            url={
              language === "fr"
                ? `/fr/initiatives/${slug(next.title)}`
                : `/initiatives/${slug(next.title)}`
            }
          />
        ) : (
          <div></div> // Espace vide pour maintenir l'alignement
        )}
      </div>

      <h2 className="mb-6 text-2xl font-bold">
        {language === "fr" ? "Initiatives similaires" : "Similar initiatives"}
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
            logo={initiative.logo} // Ajout du logo
          />
        ))}
      </div>
    </div>
  );
};

export default SimilarInitiatives;
