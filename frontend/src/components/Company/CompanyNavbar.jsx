import { Link } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import Sidebar from './navigation/Sidebar';
import MobileBottomNav from './navigation/MobileBottomNav';
import UserDropdown from './navigation/UserDropdown';
import SearchBar from './navigation/SearchBar';

const UserNavbar = () => {
  const username = localStorage.getItem("name") || "User";
  const user_id = localStorage.getItem("user_id");

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-r from-[#13505B] to-[#119DA4] shadow-lg">
        <div className="h-16 px-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-[#119DA4] text-lg font-bold">C</span>
            </div>
            <span className="text-white text-lg font-semibold hidden sm:block">Company</span>
          </Link>

          <SearchBar />
          <UserDropdown username={username} user_id={user_id} />
        </div>
      </nav>

      <Sidebar />
      <MobileBottomNav />

      <div className="md:ml-64 mt-16 mb-16 md:mb-0">
        <Outlet />
      </div>
    </>
  );
};

export default UserNavbar;