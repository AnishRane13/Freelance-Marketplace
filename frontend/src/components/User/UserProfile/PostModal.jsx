import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Heart, MessageCircle, Share2, Bookmark } from "lucide-react";


const PostModal = ({ post, onClose, isPortfolio }) => {
    // Close on ESC key
    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === "Escape") onClose();
      };
      
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);
    
    // Prevent background scrolling when modal is open
    useEffect(() => {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "auto";
      };
    }, []);
    
    // Handle modal click outside to close
    const handleBackdropClick = (e) => {
      if (e.target === e.currentTarget) onClose();
    };
    
    return (
      <div 
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <div 
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-modalFadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Post Image */}
          <div className="w-full md:w-1/2 bg-blue-50">
            <div className="aspect-square md:h-full">
              <img 
                src={post.image} 
                alt={isPortfolio ? post.title : `Post ${post.id}`} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Post Details */}
          <div className="w-full md:w-1/2 flex flex-col h-full max-h-[50vh] md:max-h-full">
            {/* Header */}
            <div className="p-4 border-b border-blue-100 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full overflow-hidden mr-3">
                  {/* User avatar would go here */}
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
                </div>
                <div>
                  <h3 className="font-medium text-blue-800">
                    {isPortfolio ? post.title : "Business Name"}
                  </h3>
                  {isPortfolio && (
                    <span className="text-xs text-blue-500">{post.category}</span>
                  )}
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-blue-100 transition-colors text-blue-500"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isPortfolio ? (
                <>
                  <p className="text-blue-700">{post.description}</p>
                  <div className="mt-4 text-blue-500 text-sm">
                    <strong>Completed:</strong> {post.date}
                  </div>
                </>
              ) : (
                <p className="text-blue-700">{post.caption}</p>
              )}
            </div>
            
            {/* Footer */}
            {!isPortfolio && (
              <div className="p-4 border-t border-blue-100">
                <div className="flex justify-between mb-3">
                  <div className="flex space-x-4">
                    <button className="text-blue-500 hover:text-blue-700 transition-colors">
                      <Heart className="w-6 h-6" />
                    </button>
                    <button className="text-blue-500 hover:text-blue-700 transition-colors">
                      <MessageCircle className="w-6 h-6" />
                    </button>
                    <button className="text-blue-500 hover:text-blue-700 transition-colors">
                      <Share2 className="w-6 h-6" />
                    </button>
                  </div>
                  <button className="text-blue-500 hover:text-blue-700 transition-colors">
                    <Bookmark className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="text-blue-800 font-medium">{post.likes} likes</div>
                <div className="text-blue-400 text-sm mt-1">{post.date}</div>
              </div>
            )}
            
            {isPortfolio && (
              <div className="p-4 border-t border-blue-100">
                <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Request Similar Project
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  export default PostModal;