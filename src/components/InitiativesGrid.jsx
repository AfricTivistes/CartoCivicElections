import { useState, useMemo, useEffect } from "react";
import Card from "./Card";
import paysData from "../utils/pays.json";

const InitiativesGrid = ({ initiatives, language }) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedThematic, setSelectedThematic] = useState("");

  // Fonction pour traduire le nom d'un pays si nécessaire
  const translateCountryName = (countryName) => {
    if (language === "en") {
      // Rechercher le pays français correspondant et obtenir son nom anglais
      for (const [frName, data] of Object.entries(paysData)) {
        if (frName === countryName && data.en) {
          return data.en;
        }
      }
    }
    return countryName; // Par défaut, renvoyer le nom non traduit
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tag = params.get("tags");
    if (tag) {
      if (countries.includes(tag)) {
        setSelectedCountry(tag);
      }
      if (categories.includes(tag)) {
        setSelectedCategory(tag);
      }
      if (thematics.includes(tag)) {
        setSelectedThematic(tag);
      }
    }
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const currentPath = window.location.pathname;
    const basePath = currentPath.startsWith("/fr") ? "/fr" : "";
    let newUrl = `${basePath}/initiatives/`;

    if (selectedCountry) {
      newUrl += `?tags=${encodeURIComponent(selectedCountry)}`;
    } else if (selectedCategory) {
      newUrl += `?tags=${encodeURIComponent(selectedCategory)}`;
    } else if (selectedThematic) {
      newUrl += `?tags=${encodeURIComponent(selectedThematic)}`;
    }

    window.history.pushState({}, "", newUrl);
  }, [selectedCategory, selectedCountry, selectedThematic]);

  // Extract unique categories and countries
  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(initiatives.map((initiative) => initiative.category)),
    ];

    // Définir les catégories spéciales qui doivent apparaître à la fin
    const specialCategories = {
      fr: ["Autres", "Tout cité plus haut"],
      en: ["Other", "all above"],
    };

    // Obtenir la liste des catégories spéciales selon la langue
    const specialCats = specialCategories[language === "en" ? "en" : "fr"];

    // Séparer les catégories normales et spéciales
    const normalCategories = uniqueCategories.filter(
      (cat) => !specialCats.includes(cat),
    );

    // Organiser les catégories spéciales dans l'ordre souhaité
    let endCategories = [];
    if (language === "en") {
      // Pour l'anglais: "Other" puis "All above"
      if (uniqueCategories.includes("Other")) endCategories.push("Other");
      if (uniqueCategories.includes("all above"))
        endCategories.push("all above");
    } else {
      // Pour le français: "Autres" puis "Tout cité plus haut"
      if (uniqueCategories.includes("Autres")) endCategories.push("Autres");
      if (uniqueCategories.includes("Tout cité plus haut"))
        endCategories.push("Tout cité plus haut");
    }

    // Trier les catégories normales et ajouter les spéciales à la fin
    return [...normalCategories.sort(), ...endCategories];
  }, [initiatives, language]);

  const countries = useMemo(() => {
    const uniqueCountries = [
      ...new Set(initiatives.map((initiative) => initiative.country)),
    ];
    return uniqueCountries.sort();
  }, [initiatives]);

  // Filter initiatives based on selected category and country
  const thematics = useMemo(() => {
    const uniqueThematics = [
      ...new Set(initiatives.map((initiative) => initiative.thematic)),
    ];

    // Définir les thématiques spéciales qui doivent apparaître à la fin
    const specialThematics = {
      fr: ["Autres", "Tout cité plus haut"],
      en: ["Other", "all above"],
    };

    // Obtenir la liste des thématiques spéciales selon la langue
    const specialThems = specialThematics[language === "en" ? "en" : "fr"];

    // Séparer les thématiques normales et spéciales
    const normalThematics = uniqueThematics.filter(
      (thematic) => !specialThems.includes(thematic),
    );

    // Organiser les thématiques spéciales dans l'ordre souhaité
    let endThematics = [];
    if (language === "en") {
      // Pour l'anglais: "Other" puis "All above"
      if (uniqueThematics.includes("Other")) endThematics.push("Other");
      if (uniqueThematics.includes("all above")) endThematics.push("all above");
    } else {
      // Pour le français: "Autres" puis "Tout cité plus haut"
      if (uniqueThematics.includes("Autres")) endThematics.push("Autres");
      if (uniqueThematics.includes("Tout cité plus haut"))
        endThematics.push("Tout cité plus haut");
    }
    // Trier les thématiques normales et ajouter les spéciales à la fin
    return [...normalThematics.sort(), ...endThematics];
  }, [initiatives, language]);

  const filteredInitiatives = useMemo(() => {
    return initiatives.filter((initiative) => {
      const matchCategory =
        !selectedCategory || initiative.category === selectedCategory;
      const matchCountry =
        !selectedCountry || initiative.country === selectedCountry;
      const matchThematic =
        !selectedThematic || initiative.thematic === selectedThematic;
      return matchCategory && matchCountry && matchThematic;
    });
  }, [initiatives, selectedCategory, selectedCountry, selectedThematic]);

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-wrap gap-4 rounded-lg bg-gray-50 p-6">
        <div className="min-w-[200px] flex-1">
          <label
            htmlFor="category"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            {language === "en" ? "Category" : "Catégorie"}
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="">
              {language === "en" ? "All categories" : "Toutes les catégories"}
            </option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[200px] flex-1">
          <label
            htmlFor="country"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            {language === "en" ? "Country" : "Pays"}
          </label>
          <select
            id="country"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="">
              {language === "en" ? "All countries" : "Tous les pays"}
            </option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {language === "en" ? translateCountryName(country) : country}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[200px] flex-1">
          <label
            htmlFor="thematic"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            {language === "en" ? "Thematic" : "Thématique"}
          </label>
          <select
            id="thematic"
            value={selectedThematic}
            onChange={(e) => setSelectedThematic(e.target.value)}
            className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="">
              {language === "en" ? "All thematics" : "Toutes les thématiques"}
            </option>
            {thematics.map((thematic) => (
              <option key={thematic} value={thematic}>
                {thematic}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredInitiatives.map((initiative) => (
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

export default InitiativesGrid;
