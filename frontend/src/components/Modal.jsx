import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const Modal = ({ isOpen, onClose, onSave }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data.categories);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load categories');
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSave = () => {
    onSave(selectedCategories);
  };

  if (!isOpen) return null;

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Photography": return "📸";
      case "Coding": return "💻";
      case "Sports": return "⚽";
      case "Fashion": return "👗";
      case "Beauty": return "💄";
      case "Restaurant": return "🍽️";
      default: return "✨";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-[#13505b]/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#13505b] hover:text-[#119da4] transition-colors duration-300"
        >
          <XCircle className="w-6 h-6" />
        </button>

        <h3 className="text-3xl font-bold text-[#13505b] mb-2">Choose Your Interests</h3>
        <p className="text-[#0c7489] mb-6">Select categories that spark your curiosity</p>

        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 text-[#119da4] animate-spin" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-4">{error}</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`relative group p-4 rounded-2xl border-2 transition-all duration-300 ${
                  selectedCategories.includes(category)
                    ? 'border-[#119da4] bg-[#119da4]/10'
                    : 'border-[#13505b]/10 hover:border-[#119da4]/50 bg-white/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getCategoryIcon(category)}</span>
                  <span className="text-[#13505b] font-medium">{category}</span>
                </div>
                <div className={`absolute top-2 right-2 transition-transform duration-300 ${
                  selectedCategories.includes(category) ? 'scale-100' : 'scale-0'
                }`}>
                  <CheckCircle className="w-5 h-5 text-[#119da4]" />
                </div>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={isLoading || selectedCategories.length === 0}
          className="w-full bg-[#119da4] text-white py-4 px-6 rounded-2xl font-medium 
                   transition-all duration-300 hover:bg-[#0c7489] disabled:opacity-50 
                   disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <span>Save Preferences</span>
          <CheckCircle className="w-5 h-5" />
        </button>

        <p className="text-center text-sm text-[#13505b]/70 mt-4">
          Selected {selectedCategories.length} of {categories.length} categories
        </p>
      </div>
    </div>
  );
};

export default Modal;