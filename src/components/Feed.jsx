import React, { useRef, useEffect } from 'react';
import AdCard from './AdCard';

function Feed({ ads }) {
  const feedRef = useRef(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = 0;
    }
  }, [ads]);

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
    <div className="feed-container" ref={feedRef}>
      {ads.map((ad, index) => (
        <div key={`${ad.id}-${index}`} className="feed-item">
          <AdCard ad={ad} index={index} />
        </div>
      ))}
    </div>
  );
}

export default Feed;