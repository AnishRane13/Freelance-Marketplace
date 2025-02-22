import React, { useState } from 'react';
import { Send } from 'lucide-react';

const CommentSection = ({ onSubmitComment, comments = [], isOpen }) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onSubmitComment(newComment);
      setNewComment('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="border-t border-gray-100 p-4">
      <div className="space-y-4">
        {comments.map((comment, index) => (
          <div key={index} className="flex items-start space-x-3">
            <img
              src={comment.user_profile_picture || '/default-avatar.png'}
              alt={comment.user_name}
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1 bg-gray-50 rounded-lg p-3">
              <p className="font-medium text-sm text-gray-900">{comment.user_name}</p>
              <p className="text-gray-700 text-sm">{comment.content}</p>
            </div>
          </div>
        ))}
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