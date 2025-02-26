import { Link } from 'react-router-dom';

const CompanyPostHeader = ({ user_name, profile_picture, category_name, userId }) => (
  <div className="p-4 flex items-center space-x-3 border-b border-gray-100">
    <Link to={`/company/profile/${userId}`} className="relative">
      <img
        src={profile_picture || '/default-avatar.png'}
        alt={user_name}
        className="w-10 h-10 rounded-full object-cover bg-gray-200 cursor-pointer"
      />
      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
    </Link>
    <div>
      <Link to={`/company/profile/${userId}`} className="hover:underline">
        <h3 className="font-semibold text-[#13505b] cursor-pointer">{user_name}</h3>
      </Link>
      <span className="text-sm text-gray-500 flex items-center">
        <span className="w-2 h-2 rounded-full bg-gray-400 mr-2"></span>
        {category_name}
      </span>
    </div>
  </div>
);

export default CompanyPostHeader;
