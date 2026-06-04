import React, { useState } from 'react';
import { useInView } from 'react-intersection-observer';

function YouTubeCard({ ad }) {
  const [loaded, setLoaded] = useState(false);
  const { ref, inView } = useInView({ 
    threshold: 0.5,
    triggerOnce: false 
  });

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
  };

  const videoId = getYouTubeId(ad.youtubeUrl || ad.videoId);
  
  if (!videoId) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        color: '#fff'
      }}>
        Invalid YouTube URL
      </div>
    );
  }

  return (
    <div ref={ref} className="youtube-container">
      {inView && (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=1&modestbranding=1`}
          title={ad.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setLoaded(true)}
        />
      )}
      {!loaded && inView && <div className="skeleton-card" />}
    </div>
  );
}

export default YouTubeCard;