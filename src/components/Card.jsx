import { slug } from "@/utils/slug";
import paysData from "@/utils/pays.json";
import InitiativeImage from "./InitiativeImage";

const Card = ({ title, country, category, description, langue= "" }) => {
  const details = langue === "fr" ? "Voir les détails" : "View details";
  const link =
    langue === "fr"
      ? `/fr/initiatives/${slug(title)}`
      : `/initiatives/${slug(title)}`;
  const basePath = langue === "fr" ? "/fr/initiatives" : "/initiatives";

  // Traduire le nom du pays en anglais si on est en mode anglais
  const displayCountry =
    langue === "fr" ? country : paysData[country]?.en || country;

  return (
    <div className="to-orange-50 transform overflow-hidden rounded-lg border border-gray-100 bg-gradient-to-br from-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <a href={link}>
        <InitiativeImage
          initiative={title}
          alt={`Logo de l'initiative ${title}`}
          className="rounded-t-lg h-48 w-full object-cover"
        />
      </a>
      <div className="p-5">
        <a href={link}>
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h5>
        </a>

        <div className="mb-3 flex items-center">
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
            className="text-primary-700 hover:underline"
          >
            {displayCountry}
          </a>
        </div>

        <div className="mb-3 flex items-center">
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

        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
          {description}
        </p>

        <a 
          href={link} 
          className="w-full flex justify-center items-center px-3 py-2 text-sm font-medium text-center text-white bg-primary-green rounded-lg hover:bg-primary-green/90 focus:ring-4 focus:outline-none focus:ring-primary-green/30"
        >
          {details}
          <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
          </svg>
        </a>
      </div>
    </div>
  );
};

export default Card;