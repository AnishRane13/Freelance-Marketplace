import React from "react";

const CategoryFilter = ({ categories, selectedCategory, onChange }) => {
  return (
    <div className="relative">
      <select
        className="appearance-none bg-white border border-blue-100 rounded-full px-4 py-2 pr-8 font-medium text-blue-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        value={selectedCategory}
        onChange={(e) => onChange(e.target.value)}
      >
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <svg
          className="w-4 h-4 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default CategoryFilter;