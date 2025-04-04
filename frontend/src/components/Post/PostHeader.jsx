import { Link } from 'react-router-dom';

const PostHeader = ({ user_name, profile_picture, category_name, userId, created_at }) => {
  // Format relative time (e.g. "2m ago")
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - postDate) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return postDate.toLocaleDateString();
  };

  return (
    <div className="p-4 flex items-center space-x-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
      <Link to={`/user/profile/${userId}`} className="relative group">
        <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-blue-500 p-0.5 transform group-hover:scale-105 transition-transform duration-300">
          <img
            src={profile_picture || '/default-avatar.png'}
            alt={user_name}
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
      </Link>
      
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <Link to={`/user/profile/${userId}`}>
            <h3 className="font-bold text-gray-800 hover:text-blue-600 transition-colors duration-200">
              {user_name}
            </h3>
          </Link>
          <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
            {formatTimeAgo(created_at)}
          </span>
        </div>
        
        <div className="flex items-center mt-1">
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              {category_name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostHeader;