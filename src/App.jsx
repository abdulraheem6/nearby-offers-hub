import React, { useState, useEffect, useCallback } from 'react';
import Feed from './components/Feed';
import SearchBar from './components/SearchBar';
import CategoryFilter from './components/CategoryFilter';

// Distance calculation functions
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const getNearbyOffers = (ads, userLocation, radiusKm = 10) => {
  if (!userLocation || !ads.length) return [];
  return ads.filter(ad => {
    if (!ad.latitude || !ad.longitude) return false;
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      ad.latitude,
      ad.longitude
    );
    ad.distance = distance;
    return distance <= radiusKm;
  });
};

const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let errorMessage = 'Location access denied';
        if (error.code === 1) errorMessage = '❌ Please allow location access to see nearby offers';
        if (error.code === 2) errorMessage = '📍 Location unavailable';
        if (error.code === 3) errorMessage = '⏱️ Location request timed out';
        reject(new Error(errorMessage));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};

function App() {
  const [ads, setAds] = useState([]);
  const [originalAds, setOriginalAds] = useState([]);
  const [filteredAds, setFilteredAds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  
  // Nearby states
  const [nearbyMode, setNearbyMode] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [radius, setRadius] = useState(10);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await fetch('/nearby-offers-hub/ads.json');
      const data = await response.json();
      const sortedAds = [...data].sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
      setAds(sortedAds);
      setOriginalAds(sortedAds);
      setFilteredAds(sortedAds);
    } catch (error) {
      console.error('Error loading ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocationHandler = async () => {
    setLocationLoading(true);
    setLocationError(null);
    try {
      const location = await getUserLocation();
      setUserLocation(location);
      return location;
    } catch (error) {
      setLocationError(error.message);
      setNearbyMode(false);
      return null;
    } finally {
      setLocationLoading(false);
    }
  };

  const toggleNearbyMode = async () => {
    if (!nearbyMode) {
      setLocationLoading(true);
      const location = await getUserLocationHandler();
      if (location) {
        setNearbyMode(true);
        const nearbyOffers = getNearbyOffers(originalAds, location, radius);
        setFilteredAds(nearbyOffers);
        setSelectedCategory('all');
        setSearchTerm('');
      }
    } else {
      setNearbyMode(false);
      const sortedAds = [...originalAds].sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
      setFilteredAds(sortedAds);
      setSelectedCategory('all');
      setSearchTerm('');
    }
  };

  const handleRadiusChange = async (newRadius) => {
    setRadius(newRadius);
    if (nearbyMode && userLocation) {
      const nearbyOffers = getNearbyOffers(originalAds, userLocation, newRadius);
      setFilteredAds(nearbyOffers);
    }
  };

  const filterAds = useCallback(() => {
    let filtered = nearbyMode && userLocation 
      ? getNearbyOffers(originalAds, userLocation, radius)
      : [...originalAds];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ad => ad.category === selectedCategory);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(ad =>
        ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered = filtered.filter(ad => {
      if (!ad.expiryDate) return true;
      return new Date(ad.expiryDate) > new Date();
    });

    setFilteredAds(filtered);
  }, [originalAds, selectedCategory, searchTerm, nearbyMode, userLocation, radius]);

  useEffect(() => {
    filterAds();
  }, [filterAds]);

  const categories = ['all', ...new Set(originalAds.map(ad => ad.category))];
  const getCategoryCount = (category) => {
    if (category === 'all') return filteredAds.length;
    return filteredAds.filter(ad => ad.category === category).length;
  };

  const categoriesWithCounts = categories.map(cat => ({
    name: cat,
    count: getCategoryCount(cat)
  }));

  const toggleTheme = () => setDarkMode(!darkMode);
  const offersWithLocation = originalAds.filter(ad => ad.latitude && ad.longitude).length;

  if (loading) {
    return (
      <div className="app-container">
        <div className="header">
          <div className="header-content">
            <div className="logo">📍 Nearby Offers Hub</div>
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <button className="theme-toggle" onClick={toggleTheme}>
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
        <div className="feed-container">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="feed-item">
              <div className="skeleton-card" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // MAIN RENDER WITH NEARBY BAR - THIS IS VISIBLE NOW
  return (
    <div className="app-container">
      <div className="header">
        <div className="header-content">
          <div className="logo">📍 Nearby Offers Hub</div>
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <button className="theme-toggle" onClick={toggleTheme}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
      
      {/* NEARBY BAR - THIS SHOULD DEFINITELY SHOW NOW */}
      <div className="nearby-bar" style={{ display: 'flex', background: 'var(--bg-primary)', padding: '10px', borderBottom: '2px solid #667eea' }}>
        <button 
          className="nearby-toggle"
          onClick={toggleNearbyMode}
          disabled={locationLoading}
          style={{
            padding: '10px 20px',
            background: nearbyMode ? '#11998e' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '30px',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {locationLoading ? '📍 Getting location...' : nearbyMode ? '✅ Nearby Mode ON' : '📍 Show Nearby Offers'}
        </button>
        
        {nearbyMode && userLocation && (
          <div className="radius-selector" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', padding: '5px 15px', borderRadius: '30px' }}>
            <span>Within</span>
            <select 
              value={radius} 
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              style={{ padding: '5px 10px', borderRadius: '20px', border: '1px solid var(--border-color)' }}
            >
              <option value={1}>1 km</option>
              <option value={2}>2 km</option>
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={25}>25 km</option>
              <option value={50}>50 km</option>
            </select>
          </div>
        )}
        
        {locationError && (
          <div style={{ color: '#ff4444', fontSize: '12px', padding: '4px 12px', background: 'rgba(255,68,68,0.1)', borderRadius: '20px' }}>
            ⚠️ {locationError}
          </div>
        )}
        
        {nearbyMode && userLocation && (
          <div style={{ fontSize: '13px', color: '#11998e', fontWeight: 'bold', marginLeft: 'auto', background: 'rgba(17,153,142,0.1)', padding: '6px 12px', borderRadius: '20px' }}>
            📍 {filteredAds.length} offers within {radius}km
          </div>
        )}
        
        {!nearbyMode && offersWithLocation > 0 && (
          <div style={{ fontSize: '12px', color: '#667eea', background: 'rgba(102,126,234,0.1)', padding: '6px 12px', borderRadius: '20px' }}>
            💡 {offersWithLocation} offers have locations
          </div>
        )}
      </div>
      
      <CategoryFilter
        categories={categoriesWithCounts}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      <Feed ads={filteredAds} />
      
      <div className="results-count">
        {filteredAds.length} offer{filteredAds.length !== 1 ? 's' : ''} found
        {nearbyMode && userLocation && ` • Within ${radius}km`}
        {!nearbyMode && offersWithLocation > 0 && ` • ${offersWithLocation} offers have locations`}
      </div>
    </div>
  );
}

export default App;