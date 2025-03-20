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
      (initiative) => initiative.props.product.title !== currentInitiative.title,
    );

    // Trouver les initiatives de la même catégorie
    const sameCategory = otherInitiatives
      .filter(
        (initiative) => initiative.props.product.category === currentInitiative.category,
      )
      .slice(0, 3);

    // Trouver les initiatives du même pays
    const sameCountry = otherInitiatives
      .filter(
        (initiative) =>
          initiative.props.product.country === currentInitiative.country &&
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


  return (
    <div className="mt-12">

      <h2 className="mb-6 text-2xl font-bold">
        {language === "fr" ? "Initiatives similaires" : "Similar initiatives"}
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {similarInitiatives.map((initiative) => (
          <Card
            key={initiative.props.product.title}
            title={initiative.props.product.title}
            country={initiative.props.product.country}
            category={initiative.props.product.category}
            description={initiative.props.product.thematic}
            langue={initiative.props.product.langue}
            logo={initiative.props.product.logo} // Ajout du logo
          />
        ))}
      </div>
    </div>
  );
};

export default SimilarInitiatives;
