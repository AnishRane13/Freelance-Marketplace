import { useState } from 'react';
import { Send, Heart, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const CommentSection = ({ onSubmitComment, comments = [], isOpen }) => {
  const [newComment, setNewComment] = useState('');
  const [likedComments, setLikedComments] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onSubmitComment(newComment);
      setNewComment('');
    }
  };

  const toggleLikeComment = (commentId) => {
    setLikedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - commentDate) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return commentDate.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white p-4">
      {/* Comments List */}
      <div className="space-y-4 max-h-96 overflow-y-auto px-2 py-2 custom-scrollbar">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div 
              key={comment.comment_id} 
              className="flex items-start space-x-3 animate-fadeIn transition-all hover:bg-gray-50 p-2 rounded-lg"
            >
              <Link to={`/user/profile/${comment.user_id}`}>
                <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-gray-100 hover:ring-blue-300 transition-all duration-200">
                  <img
                    src={comment.user_profile || '/default-avatar.png'}
                    alt={comment.user_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </Link>
              
              <div className="flex-1">
                <div className="bg-white rounded-2xl shadow-sm p-3">
                  <div className="flex justify-between items-center">
                    <Link to={`/user/profile/${comment.user_id}`}>
                      <p className="font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200">
                        {comment.user_name}
                      </p>
                    </Link>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-700 mt-1 leading-relaxed">{comment.comment}</p>
                </div>
                
                <div className="flex items-center space-x-4 mt-1 ml-2">
                  <button 
                    className={`text-xs flex items-center space-x-1 ${
                      likedComments[comment.comment_id] 
                        ? 'text-red-500' 
                        : 'text-gray-500 hover:text-red-500'
                    } transition-colors duration-200`}
                    onClick={() => toggleLikeComment(comment.comment_id)}
                  >
                    <Heart className={`w-3 h-3 ${likedComments[comment.comment_id] ? 'fill-current' : ''}`} />
                    <span>Like</span>
                  </button>
                  
                  <button className="text-xs flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors duration-200">
                    <MessageSquare className="w-3 h-3" />
                    <span>Reply</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mt-4 font-medium">No comments yet</p>
            <p className="text-gray-400 text-sm">Be the first to share your thoughts!</p>
          </div>
        )}
      </div>

      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-full overflow-hidden">
            <img
              src="/default-avatar.png" 
              alt="Your avatar"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="relative flex-1">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 shadow-sm"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className={`absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-2 transition-colors duration-200 ${
                newComment.trim() 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;