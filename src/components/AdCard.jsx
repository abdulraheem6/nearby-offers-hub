import React, { useState } from 'react';
import ImageCard from './ImageCard';
import VideoCard from './VideoCard';
import CarouselCard from './CarouselCard';
import YouTubeCard from './YouTubeCard';

function AdCard({ ad, index }) {
  const [showWhatsApp, setShowWhatsApp] = useState(false);

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Hi! I'm interested in: ${ad.title}\n${ad.description}`);
    window.open(`https://wa.me/${ad.whatsapp}?text=${message}`, '_blank');
  };

  const handleShare = async () => {
    const shareData = {
      title: ad.title,
      text: ad.description,
      url: window.location.href,
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(`${ad.title}\n${ad.description}`);
      alert('Link copied to clipboard!');
    }
  };

  const renderMedia = () => {
    switch (ad.type) {
      case 'video':
        return <VideoCard ad={ad} index={index} />;
      case 'youtube':
        return <YouTubeCard ad={ad} />;
      case 'carousel':
        return <CarouselCard images={ad.images} />;
      default:
        return <ImageCard imageUrl={ad.image} />;
    }
  };

  const isExpired = ad.expiryDate && new Date(ad.expiryDate) < new Date();

  return (
    <div className="ad-card">
      <div className="ad-media">
        {renderMedia()}
        {isExpired && (
          <div style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '8px',
            fontSize: '12px'
          }}>
            Expired
          </div>
        )}
      </div>
      <div className="ad-info">
        <div className="ad-title">
          {ad.title}
          {ad.featured && <span className="featured-badge">Featured</span>}
        </div>
        <div className="ad-description">{ad.description}</div>
        <span className="ad-category">{ad.category}</span>
        {ad.expiryDate && !isExpired && (
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            Valid until: {new Date(ad.expiryDate).toLocaleDateString()}
          </div>
        )}
        <div className="action-buttons">
          <button className="whatsapp-btn" onClick={handleWhatsApp}>
            📱 WhatsApp
          </button>
          <button className="share-btn" onClick={handleShare}>
            🔗 Share
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdCard;