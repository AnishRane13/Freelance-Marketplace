import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navLinks } from './NavigationLinks';
import CreatePost from '../../CreatePost';
import CategoriesModal from '../../CategoriesModal';

const MobileBottomNav = () => {
  const location = useLocation();
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const userId = localStorage.getItem("user_id");
  
  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40">
        <div className="flex justify-around items-center h-16">
          {navLinks.map((link) => (
            link.isModal ? (
              <button
              key={link.path}
              onClick={() => 
                link.label === "Create Job" 
                  ? setShowCreateJobModal(true) 
                  : setShowCategoriesModal(true)
              }
              className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-500 transition-colors duration-200"
            >
              <link.icon className="w-6 h-6" />
              <span className="text-xs mt-1">{link.label}</span>
            </button>
            
            ) : (
              <Link
                key={link.path}
                to={link.path}
                className={`flex flex-col items-center p-2 text-gray-600 hover:text-blue-500 transition-colors duration-200 ${
                  location.pathname === link.path ? 'text-blue-500' : ''
                }`}
              >
                <link.icon className="w-6 h-6" />
                <span className="text-xs mt-1">{link.label}</span>
              </Link>
            )
          ))}
        </div>
      </div>
      
      {showCreateJobModal && (
        <CreatePost userId={userId} onClose={() => setShowCreateJobModal(false)} />
      )}

      {showCategoriesModal && (
        <CategoriesModal 
          isOpen={showCategoriesModal} 
          onClose={() => setShowCategoriesModal(false)} 
          userId={userId} 
        />
      )}
    </>
  );
};

export default MobileBottomNav;