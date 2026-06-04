import React, { useState, useEffect, useCallback } from 'react';
import Feed from './components/Feed';
import SearchBar from './components/SearchBar';
import CategoryFilter from './components/CategoryFilter';

function App() {
  const [ads, setAds] = useState([]);
  const [filteredAds, setFilteredAds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

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
      setFilteredAds(sortedAds);
    } catch (error) {
      console.error('Error loading ads:', error);
    } finally {
      setLoading(false);
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
    let filtered = [...ads];

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
  }, [ads, selectedCategory, searchTerm]);

  useEffect(() => {
    filterAds();
  }, [filterAds]);

  // Get category counts
  const getCategoryCount = (category) => {
    if (category === 'all') return ads.length;
    return ads.filter(ad => ad.category === category).length;
  };

  const categories = ['all', ...new Set(ads.map(ad => ad.category))];
  
  // Create categories with counts for display
  const categoriesWithCounts = categories.map(cat => ({
    name: cat,
    count: getCategoryCount(cat)
  }));

  const toggleTheme = () => setDarkMode(!darkMode);

  if (loading) {
    return (
      <div className="app-container">
        <div className="header">
          <div className="header-content">
            <div className="logo">Nearby Offers Hub</div>
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
          <div className="logo">Nearby Offers Hub</div>
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <button className="theme-toggle" onClick={toggleTheme}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
      <CategoryFilter
        categories={categoriesWithCounts}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      <Feed ads={filteredAds} />
      
      {/* Display number of results */}
      <div className="results-count">
        {filteredAds.length} offer{filteredAds.length !== 1 ? 's' : ''} found
      </div>
    </div>
  );
}

export default App;