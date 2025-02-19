import { Search } from 'lucide-react';

const SearchBar = () => {
  return (
    <div className="flex-1 max-w-xl px-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/20"
        />
      </div>
    </div>
  );
};

export default SearchBar;