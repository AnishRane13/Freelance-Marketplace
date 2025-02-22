import React, { useState } from 'react';
import { Heart, MessageCircle, Share2 } from "lucide-react";

const PostActions = ({ post_id, likes_count, comments_count, onLike, onCommentClick, isLiked }) => {
  return (
    <div className="px-4 py-3 flex items-center justify-between border-t border-gray-100">
      <button
        onClick={() => onLike(post_id)}
        className={`flex items-center space-x-2 transition-colors duration-200 ${
          isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
        }`}
      >
        <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
        <span className="text-sm font-medium">{likes_count}</span>
      </button>
      <button 
        onClick={onCommentClick}
        className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors duration-200"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-medium">{comments_count}</span>
      </button>
      <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors duration-200">
        <Share2 className="w-5 h-5" />
      </button>
    </div>
  );
};

export default PostActions;