import { useState, useEffect, useRef } from 'react';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';

const CreatePost = ({ userId, onClose }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, [userId]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`http://localhost:5000/categories/${userId}`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories); // Correctly set the categories
      } else {
        console.error('Failed to fetch categories:', data.error);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('category_id', selectedCategory);
      if (image) {
        formData.append('image', image);
      }

      const response = await fetch(`/api/posts/${userId}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to create post');

      // Reset form
      setContent('');
      setImage(null);
      setImagePreview(null);
      setSelectedCategory('');
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6 m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[#13505b] font-semibold text-lg">Create Post</h2>
          <button 
            onClick={onClose}
            className="text-[#13505b]/60 hover:text-[#13505b]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full h-32 p-3 bg-white rounded-lg border border-[#119da4] text-[#13505b] focus:outline-none focus:ring-2 focus:ring-[#119da4]"
            required
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-3 bg-white rounded-lg border border-[#119da4] text-[#13505b] focus:outline-none focus:ring-2 focus:ring-[#119da4]"
            required
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />

          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setImagePreview(null);
                }}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 border-2 border-dashed border-[#119da4] rounded-lg text-[#119da4] hover:bg-[#119da4]/5 transition-colors flex items-center justify-center gap-2"
            >
              <ImageIcon className="w-5 h-5" />
              Add Image
            </button>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#13505b] hover:bg-[#13505b]/5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-[#119da4] text-white rounded-lg hover:bg-[#0c7489] transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost
