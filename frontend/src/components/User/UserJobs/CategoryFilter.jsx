const CategoryFilter = ({ categories, selectedCategory, onChange }) => {
    return (
      <div className="relative">
        <select
          value={selectedCategory}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full pl-3 pr-10 py-2 text-base border-none rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 sm:text-sm bg-white text-gray-800"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    );
  };
  
  export default CategoryFilter;