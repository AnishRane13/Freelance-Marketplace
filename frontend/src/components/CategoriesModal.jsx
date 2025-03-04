import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { 
  NotificationsContainer, 
  SuccessNotification, 
  ErrorNotification 
} from '../components/Notification';

const CategoriesModal = ({ isOpen, onClose, userId }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const addNotification = (type, message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch all categories
        const categoriesResponse = await fetch('http://localhost:5000/categories');
        const categoriesData = await categoriesResponse.json();

        // Fetch user's current categories
        const userCategoriesResponse = await fetch(`http://localhost:5000/categories/${userId}`);
        const userCategoriesData = await userCategoriesResponse.json();

        if (categoriesData.success && userCategoriesData.success) {
          setCategories(categoriesData.categories);
          
          // Pre-select user's existing categories
          const existingCategoryIds = userCategoriesData.categories.map(cat => cat.id);
          setSelectedCategories(
            categoriesData.categories.filter(cat => existingCategoryIds.includes(cat.id))
          );
          setIsLoading(false);
        } else {
          throw new Error('Failed to fetch categories');
        }
      } catch (err) {
        addNotification('error', 'Failed to load categories');
        setIsLoading(false);
      }
    };
  
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen, userId]);

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.some(c => c.id === category.id)
        ? prev.filter(c => c.id !== category.id)
        : [...prev, category]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:5000/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userId,
          type: 'user',
          categories: selectedCategories
        })
      });

      const data = await response.json();
      
      if (data.success) {
        addNotification('success', 'Categories updated successfully');
        onClose();
      } else {
        const errorMessage = data.error || 'Failed to save categories';
        addNotification('error', errorMessage);
      }
    } catch (err) {
      addNotification('error', 'Failed to save categories');
    }
    setIsSaving(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <NotificationsContainer 
        notifications={notifications}
        removeNotification={removeNotification}
      />

      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div 
          className="absolute inset-0 bg-white/50 backdrop-blur-sm" 
          onClick={onClose} 
        />
        
        <div className="relative w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl border border-blue-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-blue-600 hover:text-blue-800 transition-colors duration-300"
          >
            <XCircle className="w-6 h-6" />
          </button>

          <h3 className="text-3xl font-bold text-blue-800 mb-2">Update Categories</h3>
          <p className="text-blue-600 mb-6">Select categories that represent your skills</p>

          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category)}
                  className={`relative group p-4 rounded-2xl border-2 transition-all duration-300 ${
                    selectedCategories.some(c => c.id === category.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-blue-100 hover:border-blue-300 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-blue-800 font-medium">{category.name}</span>
                  </div>
                  <div className={`absolute top-2 right-2 transition-transform duration-300 ${
                    selectedCategories.some(c => c.id === category.id) 
                      ? 'scale-100' 
                      : 'scale-0'
                  }`}>
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  </div>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={isLoading || isSaving}
            className="w-full bg-blue-500 text-white py-4 px-6 rounded-2xl font-medium 
                     transition-all duration-300 hover:bg-blue-600 disabled:opacity-50 
                     disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Save Preferences</span>
                <CheckCircle className="w-5 h-5" />
              </>
            )}
          </button>

          <p className="text-center text-sm text-blue-700/70 mt-4">
            Selected {selectedCategories.length} of {categories.length} categories
          </p>
        </div>
      </div>
    </>
  );
};

export default CategoriesModal;