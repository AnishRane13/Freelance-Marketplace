import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { useState } from 'react';

const PostActions = ({ 
  post_id, 
  likes_count, 
  comments_count, 
  onLike, 
  onCommentClick,
  isLiked,
  isLikeAnimating,
  isCommentsOpen
}) => {
  const [isSaved, setIsSaved] = useState(false);
  
  const toggleSaved = () => {
    setIsSaved(!isSaved);
  };
  
  return (
    <div className="px-4 py-3 flex items-center justify-between border-t border-b border-gray-100 bg-gray-50">
      <button
        onClick={() => onLike(post_id)}
        className={`flex items-center space-x-2 transition-all duration-200 px-3 py-1.5 rounded-full ${
          isLiked 
            ? 'text-red-500 bg-red-50' 
            : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
        }`}
        aria-label={isLiked ? "Unlike post" : "Like post"}
      >
        <Heart 
          className={`w-5 h-5 ${isLiked ? 'fill-current' : ''} ${
            isLikeAnimating ? 'animate-bounce' : ''
          }`} 
        />
        <span className="text-sm font-medium">{likes_count}</span>
      </button>
      
      <button 
        onClick={onCommentClick}
        className={`flex items-center space-x-2 transition-all duration-200 px-3 py-1.5 rounded-full ${
          isCommentsOpen 
            ? 'text-blue-500 bg-blue-50' 
            : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
        }`}
        aria-label={isCommentsOpen ? "Hide comments" : "Show comments"}
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-medium">{comments_count}</span>
      </button>
      
      <button 
        onClick={toggleSaved}
        className={`hidden sm:flex items-center space-x-2 transition-all duration-200 px-3 py-1.5 rounded-full ${
          isSaved 
            ? 'text-purple-500 bg-purple-50' 
            : 'text-gray-600 hover:text-purple-500 hover:bg-purple-50'
        }`}
        aria-label={isSaved ? "Unsave post" : "Save post"}
      >
        <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
      </button>
      
      <button 
        className="flex items-center space-x-2 text-gray-600 hover:text-green-500 hover:bg-green-50 transition-all duration-200 px-3 py-1.5 rounded-full"
        aria-label="Share post"
      >
        <Share2 className="w-5 h-5" />
        <span className="text-sm font-medium hidden md:inline">Share</span>
      </button>
    </div>
  );
};

export default PostActions;