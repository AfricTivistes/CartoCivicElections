import { slug } from "@/utils/slug";

const Card = ({ title, country, category, description, langue, logo = "" }) => {
  const details = langue === 'fr' ? 'Voir les détails' : 'View details';
  const link = langue === 'fr' ? `/fr/initiatives/${slug(title)}` : `/initiatives/${slug(title)}`;
  const basePath = langue === 'fr' ? '/fr/initiatives' : '/initiatives';

  return (
    <div className="h-full flex flex-col bg-white border shadow-sm rounded-xl dark:bg-slate-900 dark:border-gray-700 dark:shadow-slate-700/[.7]">
      <div className="flex flex-col h-full p-4 md:p-6">
        {logo && (
          <div className="flex-shrink-0 mb-4">
            <img src={logo} alt={title} className="w-full h-40 object-cover rounded-lg" />
          </div>
        )}
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
          {title}
        </h3>
        <div className="mt-2 flex flex-wrap gap-2">
          <a href={`${basePath}?tags=${country}`} className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200">
            {country}
          </a>
          <a href={`${basePath}?tags=${category}`} className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-teal-100 text-teal-800 hover:bg-teal-200">
            {category}
          </a>
        </div>
        <p className="mt-3 text-gray-500 dark:text-gray-400">
          {description}
        </p>
        <a href={link} className="mt-auto w-full inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800 py-3">
          {details}
        </a>
      </div>
    </div>
  );
};

export default Card;