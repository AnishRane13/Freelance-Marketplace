import React from 'react';

const PostHeader = ({ user_name, profile_picture, category_name }) => (
  <div className="p-4 flex items-center space-x-3 border-b border-gray-100">
    <div className="relative">
      <img
        src={profile_picture || '/default-avatar.png'}
        alt={user_name}
        className="w-10 h-10 rounded-full object-cover bg-gray-200"
      />
      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
    </div>
    <div>
      <h3 className="font-semibold text-[#13505b]">{user_name}</h3>
      <span className="text-sm text-gray-500 flex items-center">
        <span className="w-2 h-2 rounded-full bg-gray-400 mr-2"></span>
        {category_name}
      </span>
    </div>
  </div>
);

export default PostHeader;