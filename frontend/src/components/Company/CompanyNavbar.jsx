import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserCircle, ChevronDown, LogOut, Settings, Menu, X, Home, FolderKanban, BarChart3, FileText } from 'lucide-react';

const CompanyNavbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const username = localStorage.getItem("name") || "User";
  const company_id = localStorage.getItem("user_id");

  console.log("Id is here", company_id)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.user-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen]);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

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
      } else {
        console.error("Logout failed:", data.error);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navLinks = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/projects", label: "Projects", icon: FolderKanban },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/reports", label: "Reports", icon: FileText },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-r from-[#13505B] to-[#119DA4] shadow-lg w-full">
        <div className="mx-auto px-3 sm:px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <Link to="/user/dashboard" className="flex items-center space-x-2 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-[#119DA4] text-lg sm:text-2xl font-bold">C</span>
              </div>
              <span className="text-white text-base sm:text-xl font-semibold hidden sm:block truncate">Company</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-white p-1.5 hover:bg-[#0C7489] rounded-lg transition-colors duration-200"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-white hover:text-[#E3F6F5] transition-colors duration-200 font-medium flex items-center space-x-1"
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>

            <div className="relative user-dropdown hidden md:block">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 text-white focus:outline-none hover:bg-[#0C7489] rounded-lg px-2 py-1 transition-colors duration-200"
              >
                <div className="w-8 h-8 rounded-full bg-[#0C7489] flex items-center justify-center">
                  <UserCircle className="w-6 h-6" />
                </div>
                <span className="font-medium truncate max-w-[100px]">{username}</span>
                <ChevronDown className="w-4 h-4 transition-transform duration-200" style={{
                  transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)'
                }} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu">
                    <Link
                        to={`/company/profile/${company_id}`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#119DA4] transition-colors duration-200"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Profile Settings
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#119DA4] transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div 
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
        
        <div 
          className={`fixed inset-y-0 left-0 w-64 max-w-[80vw] bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex justify-between items-center p-3 border-b">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-[#119DA4] rounded-lg flex items-center justify-center">
                  <span className="text-white text-base font-bold">LC</span>
                </div>
                <span className="text-lg font-semibold text-[#119DA4] truncate">LogoCompany</span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* User Profile Section - Now at the top of sidebar */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-[#0C7489] flex items-center justify-center flex-shrink-0">
                  <UserCircle className="w-8 h-8 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 text-lg truncate">{username}</div>
                  <div className="text-sm text-gray-500">Welcome back!</div>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto py-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center space-x-2 px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-[#119DA4] transition-colors duration-200"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
              
              {/* Profile and Logout Links */}
              <Link
                  to={`/company/profile/${company_id}`}
                className="flex items-center space-x-2 px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-[#119DA4] transition-colors duration-200"
                onClick={() => setIsSidebarOpen(false)}
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Profile</span>
              </Link>
              
              <button
                onClick={() => {
                  handleLogout();
                  setIsSidebarOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-[#119DA4] transition-colors duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="h-16" />
    </>
  );
};

export default CompanyNavbar;