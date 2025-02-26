
import { slug } from '@/utils/slug';
import SecondaryCTA from "@components/ui/buttons/SecondaryCTA";

const getCategoryColors = (category) => {
  const normalizedCategory = category.toLowerCase().trim();
  switch(normalizedCategory) {
    case 'sensibilisation':
      return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
    case 'information':
      return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
    case 'éducation':
    case 'education':
      return 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
  }
}

const Card = ({ title, country, category, description, langue }) => {
  const details = langue === 'fr' ? 'Voir les détails' : 'View details';
  const link = langue === 'fr' ? `/fr/initiatives/${slug(title)}` : `/initiatives/${slug(title)}`;
  const basePath = langue === 'fr' ? '/fr/initiatives' : '/initiatives';

  return (
    <div className="bg-gradient-to-br from-white to-orange-50 rounded-lg shadow-md hover:shadow-lg border border-gray-100 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      <div className="p-8 flex flex-col h-full">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">{title}</h3>
        
        <div className="flex items-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <a href={`${basePath}?tags=${encodeURIComponent(country)}`} className="text-lg text-primary-700 hover:underline">
            {country}
          </a>
        </div>

        <a href={`${basePath}?tags=${encodeURIComponent(description)}`} className="text-gray-600 flex-grow mb-6 leading-relaxed hover:text-primary-600">
          {description}
        </a>

        <div className="flex flex-wrap gap-2 mb-6">
          <a href={`${basePath}?tags=${encodeURIComponent(category)}`} className="hover:underline">
            {category}
          </a>
        </div>
        
        <SecondaryCTA title={details} url={link} />
      </div>
    </div>
  );
};

export default Card;
