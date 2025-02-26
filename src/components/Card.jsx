
import { slug } from "@/utils/slug";

const Card = ({ title, country, category, description, langue, logo = "" }) => {
  const details = langue === 'fr' ? 'Voir les détails' : 'View details';
  const link = langue === 'fr' ? `/fr/initiatives/${slug(title)}` : `/initiatives/${slug(title)}`;
  const basePath = langue === 'fr' ? '/fr/initiatives' : '/initiatives';

  return (
    <div className="bg-gradient-to-br from-white to-orange-50 rounded-lg shadow-md hover:shadow-lg border border-gray-100 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      <div className="p-8 flex flex-col h-full">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">{title}</h3>
        
        <div className="flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <a href={`${basePath}?tags=${encodeURIComponent(country)}`} className="text-lg text-primary-700 hover:underline transition-colors duration-200">
            {country}
          </a>
        </div>

        <div className="flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
          <a href={`${basePath}?tags=${encodeURIComponent(category)}`} className="text-primary-700 hover:underline transition-colors duration-200">
            {category}
          </a>
        </div>

        <div className="flex items-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
          </svg>
          <a href={`${basePath}?tags=${encodeURIComponent(description)}`} className="text-primary-700 hover:underline transition-colors duration-200">
            {description}
          </a>
        </div>

        {logo && (
          <div className="mb-4">
            <img src={logo} alt={`Logo de ${title}`} className="w-16 h-16 object-contain" />
          </div>
        )}

        <a
          href={link}
          className="mt-auto inline-flex items-center text-primary-600 hover:text-primary-700"
        >
          {details}
          <svg
            className="w-5 h-5 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default Card;
