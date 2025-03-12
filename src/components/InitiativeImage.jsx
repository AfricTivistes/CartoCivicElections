
import { useState, useEffect } from "react";
import { slug } from "@/utils/slug";

const InitiativeImage = ({ initiative, alt = "Image de l'initiative", className = "" }) => {
  const [imageSrc, setImageSrc] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const defaultImage = "https://placehold.co/600x600?text=Soobu+No+Image+Available";
  
  useEffect(() => {
    const loadImage = () => {
      // Déterminer le slug de l'initiative
      let initiativeSlug = "";
      if (typeof initiative === "string" && initiative) {
        initiativeSlug = slug(initiative);
      } else if (typeof initiative?.title === "string" && initiative.title) {
        initiativeSlug = slug(initiative.title);
      }
      
      // Si aucun slug valide n'est disponible, utiliser l'image par défaut
      if (!initiativeSlug) {
        setImageSrc(defaultImage);
        return;
      }
      
      // Construire le chemin de l'image locale
      const localImagePath = `/initiatives/${initiativeSlug}.webp`;
      
      // Créer une nouvelle image pour tester si le fichier existe
      const img = new Image();
      img.onload = () => {
        setImageSrc(localImagePath);
        setIsLoaded(true);
      };
      img.onerror = () => {
        // Si l'image locale n'existe pas, essayer d'utiliser l'URL signée si disponible
        if (initiative?.["image-logo"]?.[0]?.signedUrl) {
          setImageSrc(initiative["image-logo"][0].signedUrl);
        } else {
          setImageSrc(defaultImage);
        }
        setIsLoaded(true);
      };
      img.src = localImagePath;
    };
    
    loadImage();
  }, [initiative]);

  return (
    <div className={`initiative-image-container ${className}`}>
      <img
        src={imageSrc || defaultImage}
        alt={alt}
        className={`w-full h-48 object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (imageSrc !== defaultImage) {
            setImageSrc(defaultImage);
          }
        }}
        loading="lazy"
      />
    </div>
  );
};

export default InitiativeImage;
