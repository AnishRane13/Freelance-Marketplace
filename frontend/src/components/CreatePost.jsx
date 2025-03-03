import { useState, useEffect, useRef } from 'react';
import { X, Image as ImageIcon, Loader2, Smile, Paperclip } from 'lucide-react';

const CreatePost = ({ userId, onClose }) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [animation, setAnimation] = useState('scale-95 opacity-0');
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

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
      const response = await fetch(`http://localhost:5000/categories/${userId}`);
      const data = await response.json();
      if (response.ok && data.success) {
        setCategories(data.categories);
      } else {
        console.error('Failed to fetch categories:', data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
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
    if (!content.trim() || !selectedCategory) {
      alert('Please fill in all required fields');
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

      // Success animation and reset
      setContent('');
      setImages([]);
      setImagePreviews([]);
      setSelectedCategory('');
      
      // Animate and close
      handleClose();
    } catch (error) {
      console.error('Error creating post:', error.message || error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#119da4]/10 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-200">
      <div 
        ref={modalRef}
        className={`bg-white rounded-xl w-full max-w-2xl p-6 m-4 shadow-xl transition-all duration-200 ${animation} border-t-4 border-[#119da4]`}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-[#13505b] font-semibold text-xl">Create Post</h2>
          <button 
            onClick={handleClose} 
            className="text-[#13505b]/60 hover:text-[#13505b] transition-colors rounded-full hover:bg-[#119da4]/10 p-2"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-full h-0.5 bg-[#119da4]/20 mb-5"></div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full min-h-32 p-4 bg-white rounded-lg border-2 border-[#119da4]/30 text-[#13505b] focus:outline-none focus:ring-2 focus:ring-[#119da4]/50 focus:border-transparent transition-all duration-200 resize-y"
            required
          />

          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-3 pl-4 pr-10 bg-white rounded-lg border-2 border-[#119da4]/30 text-[#13505b] focus:outline-none focus:ring-2 focus:ring-[#119da4]/50 focus:border-transparent appearance-none transition-all duration-200"
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#119da4]">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-[#119da4]/5 rounded-lg border border-[#119da4]/20">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group rounded-lg overflow-hidden shadow-md bg-white border border-[#119da4]/20">
                  <img 
                    src={preview} 
                    alt={`Preview ${index + 1}`} 
                    className="w-full h-32 object-cover transition-transform duration-200 group-hover:scale-105" 
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-white text-[#119da4] rounded-full hover:bg-[#119da4] hover:text-white transition-all duration-200 transform hover:scale-105 shadow-lg"
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
              className="flex-1 py-3 px-4 bg-white border-2 border-[#119da4] rounded-lg text-[#119da4] hover:bg-[#119da4]/5 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <ImageIcon className="w-5 h-5" />
              Add Images
            </button>
            
            <button
              type="button"
              className="py-3 px-4 bg-white border-2 border-[#119da4] rounded-lg text-[#119da4] hover:bg-[#119da4]/5 transition-colors flex items-center justify-center"
              aria-label="Add emoji"
            >
              <Smile className="w-5 h-5" />
            </button>
            
            <button
              type="button"
              className="py-3 px-4 bg-white border-2 border-[#119da4] rounded-lg text-[#119da4] hover:bg-[#119da4]/5 transition-colors flex items-center justify-center"
              aria-label="Add attachment"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </div>

          <div className="w-full h-0.5 bg-[#119da4]/20 my-2"></div>

          <div className="flex justify-end gap-3">
            <button 
              type="button" 
              onClick={handleClose} 
              className="px-5 py-2.5 text-[#13505b] bg-white border border-[#119da4]/30 hover:bg-[#119da4]/5 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-[#119da4] text-white rounded-lg hover:bg-[#0c7489] transition-colors shadow-md disabled:opacity-70 flex items-center gap-2 font-medium"
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
  );
};

export default CreatePost;