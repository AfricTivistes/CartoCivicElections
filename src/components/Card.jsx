import { slug } from "@/utils/slug";
import PrimaryCTA from "@/components/ui/buttons/PrimaryCTA.astro";

const Card = ({ title, country, category, description, langue, logo = "" }) => {
  const details = langue === 'fr' ? 'Voir les détails' : 'View details';
  const basePath = langue === 'fr' ? '/fr/initiatives' : '/initiatives';
  const link = `${basePath}/${slug(title)}`;

  return (
    <div className="bg-gradient-to-br from-white to-orange-50 rounded-lg shadow-md hover:shadow-lg border border-gray-100 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      <div className="p-8 flex flex-col h-full">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">{title}</h3>

        <div className="flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="text-lg text-primary-700">{country}</span>
        </div>

        <p className="text-gray-600 flex-grow mb-6 leading-relaxed">
          {description}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {category}
        </div>

        <div className="mt-auto w-full">
          <PrimaryCTA title={details} url={link} />
        </div>
      </div>
    </div>
  );
};

export default Card;