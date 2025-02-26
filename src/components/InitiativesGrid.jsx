import { useState, useMemo, useEffect } from "react";
import Card from "./Card";

const InitiativesGrid = ({ initiatives, language }) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedThematic, setSelectedThematic] = useState("");

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
    return uniqueCategories.sort();
  }, [initiatives]);

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
    return uniqueThematics.sort();
  }, [initiatives]);

  const filteredInitiatives = useMemo(() => {
    if (!selectedCategory && !selectedCountry && !selectedThematic) {
      return initiatives;
    }
    return initiatives.filter((initiative) => {
      if (selectedCategory && initiative.category !== selectedCategory) return false;
      if (selectedCountry && initiative.country !== selectedCountry) return false;
      if (selectedThematic && initiative.thematic !== selectedThematic) return false;
      return true;
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
                {country}
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