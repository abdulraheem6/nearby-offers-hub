import React, { useState, useEffect } from 'react';

function ImageCard({ imageUrl }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => setLoaded(true);
    img.onerror = () => {
      setError(true);
      setLoaded(true);
    };
  }, [imageUrl]);

  if (!loaded) {
    return <div className="skeleton-card" />;
  }

  if (error) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        color: '#fff',
        textAlign: 'center',
        padding: '20px'
      }}>
        📷 Image not available
      </div>
    );
  }

  return (
    <img 
      src={imageUrl} 
      alt="Advertisement" 
      loading="lazy"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        background: '#000'
      }}
    />
  );
}

export default ImageCard;