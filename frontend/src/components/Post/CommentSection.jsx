import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CommentSection = ({ onSubmitComment, comments = [], isOpen }) => {
  const [newComment, setNewComment] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onSubmitComment(newComment);
      setNewComment('');
    }
  };

  const navigateToUserProfile = (userId) => {
    navigate(`/user/profile/${userId}`);
  };

  if (!isOpen) return null;

  return (
    <div className="border-t border-gray-100 p-4">
      <div className="space-y-4 max-h-64 overflow-y-auto">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.comment_id} className="flex items-start space-x-3">
              <img
                src={comment.user_profile || '/default-avatar.png'}
                alt={comment.user_name}
                className="w-8 h-8 rounded-full object-cover cursor-pointer"
                onClick={() => navigateToUserProfile(comment.user_id)}
              />
              <div className="flex-1 bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <p 
                    className="font-medium text-sm text-gray-900 cursor-pointer hover:underline"
                    onClick={() => navigateToUserProfile(comment.user_id)}
                  >
                    {comment.user_name}
                  </p>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 text-sm mt-1">{comment.comment}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 text-sm py-2">No comments yet. Be the first to comment!</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex items-center space-x-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={!newComment.trim()}
          className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default CommentSection;