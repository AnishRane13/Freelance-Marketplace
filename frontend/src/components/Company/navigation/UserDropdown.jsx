import { Link, useNavigate } from 'react-router-dom';
import { UserCircle, ChevronDown, LogOut, Settings } from 'lucide-react';
import { useState } from 'react';

const UserDropdown = ({ username, user_id }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/logout", {
        method: "POST"
      });
      const data = await response.json();
      if (data.success) {
        localStorage.removeItem("token");
        localStorage.removeItem("name");
        navigate("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 text-white focus:outline-none hover:bg-[#0C7489] rounded-lg px-3 py-1.5"
      >
        <UserCircle className="w-6 h-6" />
        <span className="hidden sm:block font-medium">{username}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <Link
            to={`/company/profile/${user_id}`}
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsDropdownOpen(false)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Profile Settings
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;