import { useEffect, useState } from "react";
import Modal from "../../../components/Modal";
import { Settings, Layout, Edit2, AlertCircle, LogOut, User, Mail, Calendar } from "lucide-react";

const UserDashboard = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: "User",
    email: "",
    created_at: "",
    profile_picture: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem("user_id");
        const token = localStorage.getItem("token");
  
        if (!userId || !token) {
          window.location.href = "/login";
          return;
        }
        
        const areCategoriesSelected = localStorage.getItem("categoriesSelected");
  
        if (areCategoriesSelected !== "true") {
          setIsModalOpen(true);
        } 
  
        // Fetch user data
        const userResponse = await fetch(`http://localhost:5000/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const userData = await userResponse.json();
        if (userData.success) {
          // Update the user data state with all fields from API
          setUserData({
            name: userData.user.name,
            email: userData.user.email,
            created_at: new Date(userData.user.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long'
            }),
            profile_picture: userData.user.profile_picture,
            bio: userData.user.bio,
            user_type: userData.user.user_type
          });
  
          // Update categories if they exist
          if (userData.user.categories && Array.isArray(userData.user.categories)) {
            setSelectedCategories(userData.user.categories);
            // Update localStorage only if categories exist
            if (userData.user.categories.length > 0) {
              localStorage.setItem("categoriesSelected", "true");
            }
          }
        }
        
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchUserData();
  }, []);

  const handleSaveCategories = async (categories) => {
    try {
      const user_id = localStorage.getItem("user_id");
      const token = localStorage.getItem("token");
      const userType = localStorage.getItem("userType");

      if (!user_id || !token || !userType) {
        console.error("Missing required data");
        return;
      }

      const response = await fetch("http://localhost:5000/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          id: user_id, 
          type: userType, 
          categories 
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSelectedCategories(categories);
        setIsModalOpen(false);
      } else {
        console.error("Error saving categories:", data.error);
      }
    } catch (error) {
      console.error("Failed to save categories:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#13505b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#13505b] p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Welcome back, {userData.name}
            </h1>
          </div>
        
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Categories Card */}
          <div className="bg-white/80 p-4 sm:p-6 rounded-2xl border border-white/20 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg sm:text-xl font-semibold text-[#13505b]">Your Categories</h2>
              <Layout className="w-5 h-5 text-[#119da4]" />
            </div>
            {selectedCategories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map((category) => (
                  <span
                    key={category}
                    className="px-3 py-1 bg-[#119da4]/10 text-[#119da4] rounded-full text-sm font-medium"
                  >
                    {category}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[#13505b]/60">
                <AlertCircle className="w-4 h-4" />
                <p>No categories selected</p>
              </div>
            )}
          </div>

          {/* Profile Details Card */}
          <div className="bg-white/80 p-4 sm:p-6 rounded-2xl border border-white/20 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg sm:text-xl font-semibold text-[#13505b]">Profile Details</h2>
              <Edit2 className="w-5 h-5 text-[#119da4]" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#119da4]" />
                <div>
                  <label className="text-sm text-[#13505b]/60">Name</label>
                  <p className="text-[#13505b]">{userData.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#119da4]" />
                <div>
                  <label className="text-sm text-[#13505b]/60">Email</label>
                  <p className="text-[#13505b]">{userData.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#119da4]" />
                <div>
                  <label className="text-sm text-[#13505b]/60">Member Since</label>
                  <p className="text-[#13505b]">{userData.created_at}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-white/80 p-4 sm:p-6 rounded-2xl border border-white/20 shadow-md">
            <h2 className="text-lg sm:text-xl font-semibold text-[#13505b] mb-3">Quick Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 sm:p-4 bg-[#119da4]/10 rounded-xl">
                <p className="text-sm text-[#13505b]/60">Categories</p>
                <p className="text-xl sm:text-2xl font-bold text-[#119da4]">{selectedCategories.length}</p>
              </div>
              <div className="p-3 sm:p-4 bg-[#119da4]/10 rounded-xl">
                <p className="text-sm text-[#13505b]/60">Last Updated</p>
                <p className="text-xl sm:text-2xl font-bold text-[#119da4]">Today</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveCategories}
        initialCategories={selectedCategories}
      />
    </div>
  );
};

export default UserDashboard;