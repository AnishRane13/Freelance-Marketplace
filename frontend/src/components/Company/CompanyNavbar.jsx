// src/components/UserNavbar.jsx
import { Link, useNavigate } from 'react-router-dom';

const CompanyNavbar = () => {

    const navigate = useNavigate();

    const handleLogout = async () => {
      try {
        const response = await fetch("http://localhost:5000/logout", {
          method: "POST"
        });
  
        const data = await response.json();
  
        if (data.success) {
          localStorage.removeItem("token"); 
          navigate("/"); 
        } else {
          console.error("Logout failed:", data.error);
        }
      } catch (error) {
        console.error("Logout error:", error);
      }
    };
    
    return (
  <nav className="bg-blue-600 p-4">
    <div className="container mx-auto flex justify-between items-center">
      <Link to="/user/dashboard" className="text-white text-xl font-bold">
        Company Dashboard
      </Link>
      <div className="space-x-4">
        <Link to="/user/profile" className="text-white hover:text-blue-200">
          Profile
        </Link>
        <Link to="/user/settings" className="text-white hover:text-blue-200">
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="text-white hover:text-blue-200"
        >
          Logout
        </button>
      </div>
    </div>
  </nav>
    )
};

export default CompanyNavbar;
