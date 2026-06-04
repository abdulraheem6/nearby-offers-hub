// import React, { useState, useEffect } from 'react';
// import ImageCard from './ImageCard';
// import VideoCard from './VideoCard';
// import CarouselCard from './CarouselCard';
// import YouTubeCard from './YouTubeCard';
// import { calculateDistance, formatDistance, getUserLocation } from '../utils/distance';

// function AdCard({ ad, index }) {
//   const [distance, setDistance] = useState(null);
//   const [locationLoading, setLocationLoading] = useState(false);

//   useEffect(() => {
//     // If ad has coordinates, calculate distance
//     if (ad.latitude && ad.longitude) {
//       setLocationLoading(true);
//       getUserLocation()
//         .then(userLocation => {
//           const dist = calculateDistance(
//             userLocation.lat,
//             userLocation.lng,
//             ad.latitude,
//             ad.longitude
//           );
//           setDistance(dist);
//         })
//         .catch(err => {
//           console.log('Location error:', err);
//         })
//         .finally(() => {
//           setLocationLoading(false);
//         });
//     }
//   }, [ad.latitude, ad.longitude]);

//   const handleWhatsApp = () => {
//     const message = encodeURIComponent(
//       `Hi! I'm interested in: ${ad.title}\n${ad.description}\n${distance ? `\n📍 ${formatDistance(distance)} from you` : ''}`
//     );
//     window.open(`https://wa.me/${ad.whatsapp}?text=${message}`, '_blank');
//   };

//   const handleShare = async () => {
//     const shareData = {
//       title: ad.title,
//       text: `${ad.description}${distance ? ` - ${formatDistance(distance)} from you` : ''}`,
//       url: window.location.href,
//     };
    
//     if (navigator.share) {
//       try {
//         await navigator.share(shareData);
//       } catch (err) {
//         console.log('Error sharing:', err);
//       }
//     } else {
//       navigator.clipboard.writeText(`${ad.title}\n${ad.description}\n\nCheck out this offer!`);
//       alert('Link copied to clipboard!');
//     }
//   };

//   const renderMedia = () => {
//     switch (ad.type) {
//       case 'video':
//         return <VideoCard ad={ad} index={index} />;
//       case 'youtube':
//         return <YouTubeCard ad={ad} />;
//       case 'carousel':
//         return <CarouselCard images={ad.images} />;
//       default:
//         return <ImageCard imageUrl={ad.image} />;
//     }
//   };

//   const isExpired = ad.expiryDate && new Date(ad.expiryDate) < new Date();

//   return (
//     <div className="ad-card">
//       <div className="ad-media">
//         {renderMedia()}
//         {isExpired && (
//           <div className="expiry-badge">
//             Expired
//           </div>
//         )}
//       </div>
//       <div className="ad-info">
//         <div className="ad-title">
//           {ad.title}
//           {ad.featured && <span className="featured-badge">⭐ Featured</span>}
//         </div>
//         <div className="ad-description">{ad.description}</div>
        
//         {/* Display distance if available */}
//         {distance !== null && !locationLoading && (
//           <div style={{ 
//             fontSize: '12px', 
//             color: '#667eea', 
//             marginBottom: '8px',
//             display: 'flex',
//             alignItems: 'center',
//             gap: '4px'
//           }}>
//             📍 {formatDistance(distance)}
//           </div>
//         )}
        
//         {locationLoading && (
//           <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
//             📍 Getting distance...
//           </div>
//         )}
        
//         <span className="ad-category">{ad.category}</span>
//         {ad.expiryDate && !isExpired && (
//           <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
//             📅 Valid until: {new Date(ad.expiryDate).toLocaleDateString()}
//           </div>
//         )}
//         <div className="action-buttons">
//           <button className="whatsapp-btn" onClick={handleWhatsApp}>
//             💬 WhatsApp
//           </button>
//           <button className="share-btn" onClick={handleShare}>
//             🔗 Share
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default AdCard;
import React from 'react';
import ImageCard from './ImageCard';
import VideoCard from './VideoCard';
import CarouselCard from './CarouselCard';
import YouTubeCard from './YouTubeCard';
import { formatDistance } from '../utils/distance';

function AdCard({ ad, index }) {
  const handleWhatsApp = () => {
    const locationText = ad.distance ? `\n📍 ${formatDistance(ad.distance)} from you` : '';
    const message = encodeURIComponent(
      `Hi! I'm interested in: ${ad.title}\n${ad.description}${locationText}`
    );
    window.open(`https://wa.me/${ad.whatsapp}?text=${message}`, '_blank');
  };

  const handleShare = async () => {
    const locationText = ad.distance ? ` - ${formatDistance(ad.distance)} away` : '';
    const shareData = {
      title: ad.title,
      text: `${ad.description}${locationText}`,
      url: window.location.href,
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(`${ad.title}\n${ad.description}${locationText}\n\nCheck out this offer!`);
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
          <div className="expiry-badge">
            Expired
          </div>
        )}
      </div>
      <div className="ad-info">
        <div className="ad-title">
          {ad.title}
          {ad.featured && <span className="featured-badge">⭐ Featured</span>}
        </div>
        <div className="ad-description">{ad.description}</div>
        
        {/* Display distance if available */}
        {ad.distance !== undefined && ad.distance !== null && (
          <div className="distance-badge">
            📍 {formatDistance(ad.distance)}
          </div>
        )}
        
        <span className="ad-category">{ad.category}</span>
        {ad.expiryDate && !isExpired && (
          <div className="expiry-date">
            📅 Valid until: {new Date(ad.expiryDate).toLocaleDateString()}
          </div>
        )}
        <div className="action-buttons">
          <button className="whatsapp-btn" onClick={handleWhatsApp}>
            💬 WhatsApp
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