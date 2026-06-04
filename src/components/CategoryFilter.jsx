import React, { useRef, useEffect } from 'react';

function CategoryFilter({ categories, selectedCategory, setSelectedCategory }) {
  const filterRef = useRef(null);
  const activeButtonRef = useRef(null);

  // Auto-scroll to active category
  useEffect(() => {
    if (activeButtonRef.current && filterRef.current) {
      const container = filterRef.current;
      const activeBtn = activeButtonRef.current;
      const scrollLeft = activeBtn.offsetLeft - container.offsetLeft - (container.offsetWidth / 2) + (activeBtn.offsetWidth / 2);
      
      container.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: 'smooth'
      });
    }
  }, [selectedCategory]);

  return (
    <div className="category-filter" ref={filterRef}>
      {categories.map((category) => (
        <button
          key={category.name}
          ref={selectedCategory === category.name ? activeButtonRef : null}
          className={`category-btn ${selectedCategory === category.name ? 'active' : ''}`}
          onClick={() => setSelectedCategory(category.name)}
        >
          {category.name === 'all' ? 'All' : category.name}
          <span className="category-count">({category.count})</span>
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;