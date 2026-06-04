import React, { useState, useEffect, useRef } from 'react';
import AdCard from './AdCard';

function VirtualFeed({ ads }) {
  const [visibleAds, setVisibleAds] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef(null);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setVisibleAds(ads.slice(0, ITEMS_PER_PAGE));
    setPage(1);
  }, [ads]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && visibleAds.length < ads.length) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loading, visibleAds.length, ads.length]);

  const loadMore = () => {
    setLoading(true);
    setTimeout(() => {
      const nextPage = page + 1;
      const start = 0;
      const end = nextPage * ITEMS_PER_PAGE;
      setVisibleAds(ads.slice(start, end));
      setPage(nextPage);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="feed-container">
      {visibleAds.map((ad, index) => (
        <div key={`${ad.id}-${index}`} className="feed-item">
          <AdCard ad={ad} index={index} />
        </div>
      ))}
      
      {visibleAds.length < ads.length && (
        <div ref={loaderRef} className="loading-more">
          {loading ? 'Loading more offers...' : 'Scroll for more'}
        </div>
      )}
      
      {visibleAds.length === ads.length && ads.length > 0 && (
        <div className="loading-more">
          ✓ All {ads.length} offers loaded
        </div>
      )}
    </div>
  );
}

export default VirtualFeed;