
import { useState } from "react";

const InitiativeLogo = ({ src, alt, className = "" }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (!src || hasError) {
    return null;
  }

  return (
    <div className={`logo-container ${isLoaded ? 'visible' : 'hidden'} ${className}`}>
      <img
        src={src}
        alt={alt || "Logo"}
        className={`w-auto max-h-24 object-contain transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onError={() => setHasError(true)}
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
      />
    </div>
  );
};

export default InitiativeLogo;
