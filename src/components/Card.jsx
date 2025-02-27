import { useState, useEffect } from 'react';
import { slug } from '../utils/slug.js';

export default function Card({ title, country, category, description, language }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const cardSlug = slug(title);
  const initiativeLink = language === 'fr' 
    ? `/fr/initiatives/${cardSlug}`
    : `/initiatives/${cardSlug}`;

  const readMoreText = language === 'fr' ? 'Lire plus' : 'Read more';

  return (
    <div className="group flex flex-col h-full bg-white border border-gray-200 shadow-sm rounded-xl dark:bg-neutral-800 dark:border-neutral-700 dark:shadow-neutral-700/[.7]">
      <div className="p-4 md:p-6 h-full flex flex-col">
        <span className="block mb-1 text-xs font-semibold uppercase text-orange-400 dark:text-orange-300">
          {category || "Non catégorisé"}
        </span>
        <h3 className="text-xl font-semibold text-balance text-neutral-600 dark:text-neutral-200">
          {title || "Initiative sans titre"}
        </h3>
        <p className="mt-3 text-neutral-500 dark:text-neutral-400">
          {country || "Pays non spécifié"}
        </p>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400 line-clamp-3">
          {description || "Description non disponible"}
        </p>
        <div className="mt-auto">
          <a
            href={initiativeLink}
            className="mt-5 inline-flex items-center gap-x-1 text-sm font-medium text-primary-green hover:text-emerald-600 disabled:opacity-50 disabled:pointer-events-none dark:text-primary-green dark:hover:text-emerald-500"
          >
            {readMoreText}
            <svg
              className="flex-shrink-0 w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}