import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navLinks } from './NavigationLinks';

const MobileBottomNav = () => {
  const location = useLocation();
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t">
      <div className="flex justify-around items-center h-16">
        {navLinks.map((link) => (
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
        ))}
      </div>
    </div>
  );
};

export default MobileBottomNav;