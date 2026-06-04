import React, { useState, useEffect, useCallback } from 'react';
import Feed from './components/Feed';
import SearchBar from './components/SearchBar';
import CategoryFilter from './components/CategoryFilter';
import { getUserLocation, getNearbyOffers, sortByDistance } from './utils/distance';

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
  const [radius, setRadius] = useState(10); // 10km default radius

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
      const sortedAds = sortAdsByFeatured(data);
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

  const applyNearbyFilter = useCallback((location, currentRadius, adsToFilter = ads) => {
    if (!location) return [];
    
    const nearbyOffers = getNearbyOffers(adsToFilter, location, currentRadius);
    console.log(`📍 Found ${nearbyOffers.length} nearby offers within ${currentRadius}km`);
    
    // Sort by distance (nearest first)
    const sortedNearby = sortByDistance(nearbyOffers, location);
    return sortedNearby;
  }, [ads]);

  const toggleNearbyMode = async () => {
    if (!nearbyMode) {
      // Turning ON nearby mode
      setLocationLoading(true);
      const location = await getUserLocationHandler();
      if (location) {
        setNearbyMode(true);
        const nearbyOffers = applyNearbyFilter(location, radius, originalAds);
        setFilteredAds(nearbyOffers);
      }
    } else {
      // Turning OFF nearby mode - show all ads
      setNearbyMode(false);
      const sortedAds = sortAdsByFeatured(originalAds);
      setFilteredAds(sortedAds);
      setSelectedCategory('all');
      setSearchTerm('');
    }
  };

  const handleRadiusChange = async (newRadius) => {
    setRadius(newRadius);
    if (nearbyMode && userLocation) {
      // Re-apply nearby filter with new radius
      const nearbyOffers = applyNearbyFilter(userLocation, newRadius, originalAds);
      setFilteredAds(nearbyOffers);
    }
  };

  const sortAdsByFeatured = (adsArray) => {
    return [...adsArray].sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
  };

  const filterAds = useCallback(() => {
    let filtered = nearbyMode && userLocation 
      ? applyNearbyFilter(userLocation, radius, originalAds)
      : [...originalAds];

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ad => ad.category === selectedCategory);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(ad =>
        ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter expired offers
    filtered = filtered.filter(ad => {
      if (!ad.expiryDate) return true;
      return new Date(ad.expiryDate) > new Date();
    });

    setFilteredAds(filtered);
  }, [originalAds, selectedCategory, searchTerm, nearbyMode, userLocation, radius, applyNearbyFilter]);

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
  
  // Count offers with location data
  const offersWithLocation = originalAds.filter(ad => ad.latitude && ad.longitude).length;

  if (loading) {
    return (
      <div className="app-container">
        <div className="header">
          <div className="header-content">
            <div className="logo">📍 Nearby Offers Hub</div>
            <button className="theme-toggle" onClick={toggleTheme}>
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
        <div className="feed-container" style={{ marginTop: '60px' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="feed-item">
              <div className="skeleton-card" />
            </div>
          ))}
        </div>
      </div>
    );
  }

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
      
      {/* Nearby Mode Toggle Bar */}
      <div className="nearby-bar">
        <button 
          className={`nearby-toggle ${nearbyMode ? 'active' : ''}`}
          onClick={toggleNearbyMode}
          disabled={locationLoading}
        >
          {locationLoading ? '📍 Getting location...' : nearbyMode ? '✅ Nearby Mode ON' : '📍 Show Nearby Offers'}
        </button>
        
        {nearbyMode && userLocation && (
          <div className="radius-selector">
            <span>Within</span>
            <select 
              value={radius} 
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              className="radius-dropdown"
            >
              <option value={1}>1 km</option>
              <option value={2}>2 km</option>
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={15}>15 km</option>
              <option value={25}>25 km</option>
              <option value={50}>50 km</option>
              <option value={100}>100 km</option>
            </select>
          </div>
        )}
        
        {locationError && (
          <div className="location-error">
            ⚠️ {locationError}
          </div>
        )}
        
        {nearbyMode && userLocation && (
          <div className="nearby-info">
            📍 {filteredAds.length} offers within {radius}km
          </div>
        )}
        
        {!nearbyMode && offersWithLocation > 0 && (
          <div className="nearby-hint">
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