import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/logout", {
        method: "POST"
      });

      const data = await response.json();

      if (data.success) {
        localStorage.removeItem("token"); // Remove token from localStorage
        navigate("/"); 
      } else {
        console.error("Logout failed:", data.error);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-md">
      Logout
    </button>
  );
};

export default LogoutButton;
