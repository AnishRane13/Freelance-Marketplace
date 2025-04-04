import { useState, useEffect, useRef } from 'react';
import { X, Image as ImageIcon, Loader2, Smile, Paperclip } from 'lucide-react';
import { NotificationsContainer } from '../components/Notification'; 

const MAX_CONTENT_LENGTH = 300; // Maximum character limit for post content
const MAX_IMAGES = 5; // Maximum number of images allowed

const CreatePost = ({ onClose }) => {
  const userId = localStorage.getItem("user_id")
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [animation, setAnimation] = useState('scale-95 opacity-0');
  const [notifications, setNotifications] = useState([]);
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  const addNotification = (message, type = 'error') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    // Animate in
    setTimeout(() => setAnimation('scale-100 opacity-100'), 10);
    
    // Add escape key listener
    const handleEscKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscKey);
    
    // Click outside to close
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    
    // Fetch categories
    fetchCategories();
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [userId]);

  const handleClose = () => {
    // Animate out
    setAnimation('scale-95 opacity-0');
    setTimeout(onClose, 200);
  };

  const fetchCategories = async () => {
    try {
      console.log("User id is here", userId)
      const response = await fetch(`http://localhost:5000/categories/${userId}`);
      const data = await response.json();
      if (response.ok && data.success) {
        setCategories(data.categories);
      } else {
        addNotification(data.error || 'Failed to fetch categories');
      }
    } catch (error) {
      addNotification('Error fetching categories');
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Check total image count
    if (images.length + files.length > MAX_IMAGES) {
      addNotification(`You can only upload a maximum of ${MAX_IMAGES} images`);
      return;
    }
    
    if (files.length === 0) return;
    
    const newImagePreviews = files.map((file) => URL.createObjectURL(file));
    setImages((prevImages) => [...prevImages, ...files]);
    setImagePreviews((prevPreviews) => [...prevPreviews, ...newImagePreviews]);
  };

  const handleRemoveImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate content length
    if (content.trim().length === 0) {
      addNotification('Post content cannot be empty');
      return;
    }
    
    if (content.trim().length > MAX_CONTENT_LENGTH) {
      addNotification(`Post content cannot exceed ${MAX_CONTENT_LENGTH} characters`);
      return;
    }
    
    // Validate category
    if (!selectedCategory) {
      addNotification('Please select a category');
      return;
    }
    
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('content', content);
      formData.append('category_id', selectedCategory);

      images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await fetch(`http://localhost:5000/posts`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create post');
      }

      // Success: Add success notification
      addNotification('Post created successfully', 'success');

      // Reset form
      setContent('');
      setImages([]);
      setImagePreviews([]);
      setSelectedCategory('');
      
      // Animate and close
      handleClose();
    } catch (error) {
      addNotification(error.message || 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-[#3B82F6]/10 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-200">
        <div 
          ref={modalRef}
          className={`bg-white rounded-xl w-full max-w-2xl p-6 m-4 shadow-xl transition-all duration-200 ${animation} border-t-4 border-[#3B82F6]`}
        >
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[#13505b] font-semibold text-xl">Create Post</h2>
            <button 
              onClick={handleClose} 
              className="text-[#13505b]/60 hover:text-[#13505b] transition-colors rounded-full hover:bg-[#3B82F6]/10 p-2"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="w-full h-0.5 bg-[#3B82F6]/20 mb-5"></div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CONTENT_LENGTH) {
                    setContent(e.target.value);
                  }
                }}
                placeholder="What's on your mind?"
                className="w-full min-h-32 p-4 bg-white rounded-lg border-2 border-[#3B82F6]/30 text-[#13505b] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-transparent transition-all duration-200 resize-y"
                required
              />
              <div className="text-sm text-gray-500 text-right mt-1">
                {content.length} / {MAX_CONTENT_LENGTH}
              </div>
            </div>

            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 pl-4 pr-10 bg-white rounded-lg border-2 border-[#3B82F6]/30 text-[#13505b] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-transparent appearance-none transition-all duration-200"
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#3B82F6]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              multiple
              className="hidden"
            />

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-[#3B82F6]/5 rounded-lg border border-[#3B82F6]/20">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group rounded-lg overflow-hidden shadow-md bg-white border border-[#3B82F6]/20">
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-32 object-cover transition-transform duration-200 group-hover:scale-105" 
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 p-1.5 bg-white text-[#3B82F6] rounded-full hover:bg-[#3B82F6] hover:text-white transition-all duration-200 transform hover:scale-105 shadow-lg"
                      aria-label="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={images.length >= MAX_IMAGES}
                className="flex-1 py-3 px-4 bg-white border-2 border-[#3B82F6] rounded-lg text-[#3B82F6] hover:bg-[#3B82F6]/5 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ImageIcon className="w-5 h-5" />
                Add Images ({images.length}/{MAX_IMAGES})
              </button>
              
            </div>

            <div className="w-full h-0.5 bg-[#3B82F6]/20 my-2"></div>

            <div className="flex justify-end gap-3">
              <button 
                type="button" 
                onClick={handleClose} 
                className="px-5 py-2.5 text-[#13505b] bg-white border border-[#3B82F6]/30 hover:bg-[#3B82F6]/5 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 bg-[#3B82F6] text-white rounded-lg hover:bg-[#225AD7] transition-colors shadow-md disabled:opacity-70 flex items-center gap-2 font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Publish Post'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <NotificationsContainer 
        notifications={notifications} 
        removeNotification={removeNotification} 
      />
    </>
  );
};

export default CreatePost;