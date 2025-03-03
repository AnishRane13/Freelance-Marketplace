// Sidebar.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navLinks } from './NavigationLinks';
import CreatePost from '../../CreatePost';

const Sidebar = ({ userId }) => {
  const location = useLocation();
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  
  return (
    <>
      <div className="hidden md:flex flex-col w-64 bg-white border-r h-screen fixed left-0 top-16">
        <div className="flex-1 py-4">
          {navLinks.map((link) => (
            link.isModal ? (
              <button
                key={link.path}
                onClick={() => setShowCreatePostModal(true)}
                className={`flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-[#119DA4] transition-colors duration-200 w-full text-left`}
              >
                <link.icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </button>
            ) : (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-[#119DA4] transition-colors duration-200 ${
                  location.pathname === link.path ? 'bg-gray-100 text-[#119DA4]' : ''
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            )
          ))}
        </div>
      </div>
      
      {showCreatePostModal && (
        <CreatePost userId={userId} onClose={() => setShowCreatePostModal(false)} />
      )}
    </>
  );
};

export default Sidebar;
