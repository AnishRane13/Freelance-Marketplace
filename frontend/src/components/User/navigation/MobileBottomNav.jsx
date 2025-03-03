// MobileBottomNav.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navLinks } from './NavigationLinks';
import CreatePost from '../../CreatePost';

const MobileBottomNav = ({ userId }) => {
  const location = useLocation();
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  
  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40">
        <div className="flex justify-around items-center h-16">
          {navLinks.map((link) => (
            link.isModal ? (
              <button
                key={link.path}
                onClick={() => setShowCreatePostModal(true)}
                className={`flex flex-col items-center p-2 text-gray-600 hover:text-[#119DA4] transition-colors duration-200`}
              >
                <link.icon className="w-6 h-6" />
                <span className="text-xs mt-1">{link.label}</span>
              </button>
            ) : (
              <Link
                key={link.path}
                to={link.path}
                className={`flex flex-col items-center p-2 text-gray-600 hover:text-[#119DA4] transition-colors duration-200 ${
                  location.pathname === link.path ? 'text-[#119DA4]' : ''
                }`}
              >
                <link.icon className="w-6 h-6" />
                <span className="text-xs mt-1">{link.label}</span>
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

export default MobileBottomNav;