import React, { useState, useEffect } from 'react';

function CarouselCard({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loaded, setLoaded] = useState([]);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    // Preload images
    images.forEach((img, idx) => {
      const image = new Image();
      image.src = img;
      image.onload = () => {
        setLoaded(prev => [...prev, idx]);
      };
    });
  }, [images]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // Swipe left
      nextSlide();
    }
    if (touchStart - touchEnd < -50) {
      // Swipe right
      prevSlide();
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  if (!loaded.includes(currentIndex)) {
    return <div className="skeleton-card" />;
  }

  return (
    <div 
      className="carousel-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={images[currentIndex]}
        alt={`Slide ${currentIndex + 1}`}
        className="carousel-image"
        loading="lazy"
      />
      {images.length > 1 && (
        <>
          <button className="carousel-arrow left" onClick={prevSlide}>
            ‹
          </button>
          <button className="carousel-arrow right" onClick={nextSlide}>
            ›
          </button>
          <div className="carousel-controls">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`carousel-dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'rgba(0,0,0,0.6)',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            zIndex: 10
          }}>
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}

export default CarouselCard;