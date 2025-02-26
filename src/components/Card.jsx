import { slug } from "@/utils/slug";
import SecondaryCTA from "@components/ui/buttons/SecondaryCTA";

const Card = ({ title, country, category, description, langue, logo = "" }) => {
  const details = langue === "fr" ? "Voir les détails" : "View details";
  const link =
    langue === "fr"
      ? `/fr/initiatives/${slug(title)}`
      : `/initiatives/${slug(title)}`;
  const basePath = langue === "fr" ? "/fr/initiatives" : "/initiatives";

  return (
    <div className="to-orange-50 transform overflow-hidden rounded-lg border border-gray-100 bg-gradient-to-br from-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex h-full flex-col p-8">
        <a href={link}>
          <h3 className="mb-6 text-2xl font-bold text-gray-900">{title}</h3>
        </a>

        <div className="mb-4 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary-500 mr-2 h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          <a
            href={`${basePath}?tags=${encodeURIComponent(country)}`}
            className="text-primary-700 text-lg hover:underline"
          >
            {country}
          </a>
        </div>

        <div className="mb-4 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary-500 mr-2 h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path
              fillRule="evenodd"
              d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
              clipRule="evenodd"
            />
          </svg>
          <a
            href={`${basePath}?tags=${encodeURIComponent(category)}`}
            className="text-primary-700 hover:underline"
          >
            {category}
          </a>
        </div>

        <div className="mb-6 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary-500 mr-2 h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
              clipRule="evenodd"
            />
          </svg>
          <a
            href={`${basePath}?tags=${encodeURIComponent(description)}`}
            className="hover:text-primary-600 text-gray-600"
          >
            {description}
          </a>
        </div>

        {logo && (
          <div className="mb-4">
            <img
              src={logo}
              alt={`Logo de ${title}`}
              className="h-16 w-16 object-contain"
            />
          </div>
        )}

        <SecondaryCTA title={details} url={link} />
      </div>
    </div>
  );
};

export default Card;
