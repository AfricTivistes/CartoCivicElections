import { useState, useMemo, useEffect } from 'react';
import Card from './Card';

const InitiativesGrid = ({ initiatives }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tag = params.get('tags');
    if (tag) {
      if (countries.includes(tag)) {
        setSelectedCountry(tag);
      }
      if (categories.includes(tag)) {
        setSelectedCategory(tag);
      }
    }
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const currentPath = window.location.pathname;
    const basePath = currentPath.startsWith('/fr') ? '/fr' : '';
    let newUrl = `${basePath}/initiatives/`;

    if (selectedCountry) {
      newUrl += `?tags=${encodeURIComponent(selectedCountry)}`;
    } else if (selectedCategory) {
      newUrl += `?tags=${encodeURIComponent(selectedCategory)}`;
    } else {
      newUrl += '?tags='; // added to handle the case where no filter is selected.
    }

    window.history.pushState({}, '', newUrl);
  }, [selectedCategory, selectedCountry]);

  // Extract unique categories and countries
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(initiatives.map(initiative => initiative.category))];
    return uniqueCategories.sort();
  }, [initiatives]);

  const countries = useMemo(() => {
    const uniqueCountries = [...new Set(initiatives.map(initiative => initiative.country))];
    return uniqueCountries.sort();
  }, [initiatives]);

  // Filter initiatives based on selected category and country
  const filteredInitiatives = useMemo(() => {
    return initiatives.filter(initiative => {
      const matchCategory = !selectedCategory || initiative.category === selectedCategory;
      const matchCountry = !selectedCountry || initiative.country === selectedCountry;
      return matchCategory && matchCountry;
    });
  }, [initiatives, selectedCategory, selectedCountry]);

  return (
    <div className="w-full">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-6 bg-gray-50 rounded-lg mb-6">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Catégorie
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            Pays
          </label>
          <select
            id="country"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">Tous les pays</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {filteredInitiatives.map((initiative) => (
          <Card
            key={initiative.title}
            title={initiative.title}
            country={initiative.country}
            category={initiative.category}
            description={initiative.description}
          />
        ))}
      </div>
    </div>
  );
};

export default InitiativesGrid;