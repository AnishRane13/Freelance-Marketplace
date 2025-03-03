import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Heart, MessageCircle, Share2, Bookmark, Calendar, Image } from "lucide-react";

const PostModal = ({ post, onClose, isPortfolio }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(parseInt(post.likes_count) || 0);
  const [isImageTransitioning, setIsImageTransitioning] = useState(false);

  // Set up keyboard listeners for navigation and closing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && post.images?.length > 1) {
        navigateImage("prev");
      }
      if (e.key === "ArrowRight" && post.images?.length > 1) {
        navigateImage("next");
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, currentImageIndex, post.images]);
  
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

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  // Handle image navigation with animation
  const navigateImage = (direction) => {
    if (!post.images || post.images.length <= 1 || isImageTransitioning) return;
    
    setIsImageTransitioning(true);
    
    if (direction === "next") {
      setCurrentImageIndex((prev) => (prev + 1) % post.images.length);
    } else {
      setCurrentImageIndex((prev) => (prev - 1 + post.images.length) % post.images.length);
    }
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsImageTransitioning(false);
    }, 500);
  };

  // Handle like functionality
  const handleLike = () => {
    // In a real app, you would make an API call here
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  // Handle share functionality
  const handleShare = () => {
    // Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: post.content,
        text: post.content,
        url: window.location.href,
      })
      .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support navigator.share
      // Could copy a link to clipboard instead
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert("Link copied to clipboard!"))
        .catch((err) => console.log('Error copying to clipboard:', err));
    }
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
        style={{animation: "fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)"}}
      >
        {/* Post Image Section */}
        <div className="w-full md:w-1/2 bg-gray-100 relative">
          <div className="aspect-square md:h-full relative overflow-hidden">
            {post.images && post.images.length > 0 ? (
              <div className="w-full h-full relative">
                <img 
                  src={post.images[currentImageIndex]} 
                  alt={`${post.content} - image ${currentImageIndex + 1}`} 
                  className={`w-full h-full object-cover absolute inset-0 transition-transform duration-500 ease-in-out ${
                    isImageTransitioning ? 'scale-105 opacity-90' : 'scale-100 opacity-100'
                  }`}
                  style={{
                    transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease"
                  }}
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-400">No image</span>
              </div>
            )}
            
            {/* Image Navigation (only if multiple images) */}
            {post.images && post.images.length > 1 && (
              <>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage("prev");
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all z-10"
                  aria-label="Previous image"
                  style={{transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.3s ease"}}
                >
                  <ChevronLeft className="w-5 h-5 text-gray-800" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage("next");
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all z-10"
                  aria-label="Next image"
                  style={{transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.3s ease"}}
                >
                  <ChevronRight className="w-5 h-5 text-gray-800" />
                </button>
                
                {/* Image Counter (e.g., 1/5) */}
                <div className="absolute top-3 left-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center">
                  <Image className="w-3 h-3 mr-1" />
                  <span>{currentImageIndex + 1}/{post.images.length}</span>
                </div>
                
                {/* Enhanced Image Indicator Dots */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-2">
                  {post.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsImageTransitioning(true);
                        setCurrentImageIndex(index);
                        setTimeout(() => setIsImageTransitioning(false), 500);
                      }}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentImageIndex 
                          ? "bg-blue-600 w-4" 
                          : "bg-white/70 hover:bg-white/90"
                      }`}
                      style={{
                        transform: index === currentImageIndex ? 'scale(1.2)' : 'scale(1)',
                        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
                      }}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
            
            {/* Category Tag (if exists) */}
            {post.category_name && (
              <div className="absolute top-3 right-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                {post.category_name}
              </div>
            )}
          </div>
        </div>
        
        {/* Post Details Section - Rest of the component remains same */}
        <div className="w-full md:w-1/2 flex flex-col h-full max-h-[50vh] md:max-h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                {post.profile_picture ? (
                  <img 
                    src={post.profile_picture} 
                    alt={`${post.user_name}'s profile`} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-800">{post.user_name}</h3>
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>{formatDate(post.created_at)}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 hover:scale-110 transition-all text-gray-500"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-gray-700 mb-6">{post.content}</p>
            
            {/* Comments Section */}
            {post.comments && post.comments.length > 0 ? (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <h4 className="font-medium text-gray-800 mb-3">Comments ({post.comments_count})</h4>
                <div className="space-y-4">
                  {post.comments.map((comment) => (
                    <div key={comment.comment_id} className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                        {comment.user_profile ? (
                          <img 
                            src={comment.user_profile} 
                            alt={`${comment.user_name}'s profile`} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg p-3">
                          <p className="font-medium text-sm text-gray-800">{comment.user_name}</p>
                          <p className="text-sm text-gray-700">{comment.comment}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(comment.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <h4 className="font-medium text-gray-800 mb-3">Comments (0)</h4>
                <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex justify-between mb-3">
              <div className="flex space-x-4">
                <button 
                  onClick={handleLike}
                  className={`transition-all ${isLiked ? 'text-red-500 scale-110' : 'text-gray-500 hover:text-red-500 hover:scale-110'}`}
                  aria-label={isLiked ? "Unlike" : "Like"}
                  style={{transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.3s ease"}}
                >
                  <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <button 
                  className="text-gray-500 hover:text-blue-500 hover:scale-110 transition-all"
                  aria-label="Comment"
                  style={{transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.3s ease"}}
                >
                  <MessageCircle className="w-6 h-6" />
                </button>
                <button 
                  onClick={handleShare}
                  className="text-gray-500 hover:text-green-500 hover:scale-110 transition-all"
                  aria-label="Share"
                  style={{transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.3s ease"}}
                >
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
              <button 
                className="text-gray-500 hover:text-yellow-500 hover:scale-110 transition-all"
                aria-label="Save"
                style={{transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.3s ease"}}
              >
                <Bookmark className="w-6 h-6" />
              </button>
            </div>
            
            <div className="text-gray-800 font-medium">{likesCount} likes</div>
            
            {/* Add Comment Section */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center">
                <input 
                  type="text" 
                  placeholder="Add a comment..." 
                  className="flex-1 border border-gray-300 rounded-full py-2 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-600 hover:scale-105 transition-all">
                  Post
                </button>
              </div>
            </div>

            {/* Additional actions for portfolio items */}
            {isPortfolio && post.category_name && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:scale-105 transition-all">
                  Request Similar Project
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostModal;