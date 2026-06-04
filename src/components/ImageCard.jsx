import React, { useState, useEffect } from 'react';

function ImageCard({ imageUrl }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => setLoaded(true);
  }, [imageUrl]);

  if (!loaded) {
    return <div className="skeleton-card" />;
  }

  return <img src={imageUrl} alt="Advertisement" loading="lazy" />;
}

export default ImageCard;