import React, { useState } from 'react';
import { useInView } from 'react-intersection-observer';

function YouTubeCard({ ad }) {
  const [player, setPlayer] = useState(null);
  const { ref, inView } = useInView({ threshold: 0.5 });

  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
  };

  const videoId = getYouTubeId(ad.youtubeUrl || ad.videoId);

  return (
    <div ref={ref} className="youtube-container">
      {inView && (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`}
          title={ad.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
}

export default YouTubeCard;