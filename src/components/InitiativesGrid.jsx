import { useState, useEffect } from 'react';
import Card from './Card.jsx';

export default function InitiativesGrid({ initiatives, language }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Ne rien afficher côté serveur
  if (!isClient || !initiatives || initiatives.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pb-14">
      {initiatives.map((initiative, index) => (
        <Card
          key={`initiative-${index}-${initiative.title}`}
          title={initiative.title}
          country={initiative.country}
          category={initiative.category}
          description={initiative.description}
          language={language}
        />
      ))}
    </div>
  );
}