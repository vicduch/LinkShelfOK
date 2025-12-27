
import React from 'react';

interface CategoryPillsProps {
  categories: string[];
  activeCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const CategoryPills: React.FC<CategoryPillsProps> = ({ categories, activeCategory, onSelectCategory }) => {
  return (
    <div className="sticky top-0 z-40 bg-[var(--bg-main)]/80 backdrop-blur-xl -mx-6 px-6 mb-8 border-b border-[var(--border)] py-3">
      <div className="flex overflow-x-auto gap-2 no-scrollbar items-center">
        <button
          onClick={() => onSelectCategory(null)}
          className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
            activeCategory === null
              ? 'bg-[var(--text-primary)] text-[var(--bg-main)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
          }`}
        >
          All
        </button>
        
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
              activeCategory === category
                ? 'bg-[var(--text-primary)] text-[var(--bg-main)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryPills;
