import React, { useState } from 'react';

function CarouselCard({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="carousel-container">
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
        </>
      )}
    </div>
  );
}

export default CarouselCard;