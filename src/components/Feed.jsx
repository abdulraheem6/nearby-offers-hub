import React, { useRef, useEffect, useState } from 'react';
import AdCard from './AdCard';

function Feed({ ads }) {
  const feedRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = 0;
    }
  }, [ads]);

  const handleScroll = () => {
    if (feedRef.current) {
      const scrollPosition = feedRef.current.scrollTop;
      setShowScrollTop(scrollPosition > 500);
    }
  };

  const scrollToTop = () => {
    if (feedRef.current) {
      feedRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  if (ads.length === 0) {
    return (
      <div className="feed-container">
        <div className="empty-state">
          <h3>No offers found</h3>
          <p>Try adjusting your search or category filter</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        className="feed-container" 
        ref={feedRef}
        onScroll={handleScroll}
      >
        {ads.map((ad, index) => (
          <div key={`${ad.id}-${index}`} className="feed-item">
            <AdCard ad={ad} index={index} />
          </div>
        ))}
      </div>
      
      {showScrollTop && (
        <button className="scroll-top-btn" onClick={scrollToTop}>
          ↑
        </button>
      )}
    </>
  );
}

export default Feed;