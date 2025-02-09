import { useEffect, useState } from "react";
// import LogoutButton from "../../../components/LogoutButton";
import Modal from "../../../components/Modal";
import { Settings, Layout, Edit2, AlertCircle } from "lucide-react";

const UserDashboard = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState("User");

  const value = 0;

  useEffect(() => {
    const storedCategories = localStorage.getItem("categoriesSelected");
    const userName = setUserName(localStorage.getItem("name"));
    console.log("storedCategories",storedCategories)
    if (storedCategories === "true") {
      setSelectedCategories(JSON.parse(storedCategories));
    } else {
      setIsModalOpen(true);
    }
  }, [value]);

  const handleSaveCategories = async (categories) => {
    try {
      const user_id = localStorage.getItem("user_id");
      const userType = localStorage.getItem("userType");

      if (!user_id || !userType) {
        console.error("User ID or User Type is missing");
        return;
      }

      const response = await fetch("http://localhost:5000/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: user_id, type: userType, categories }),
      });

      const data = await response.json();
      if (data.success) {
        setSelectedCategories(categories);
        localStorage.setItem("categoriesSelected", "true");
        setIsModalOpen(false);
      } else {
        console.error("Error saving categories:", data.error);
      }
    } catch (error) {
      console.error("Failed to save categories:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#13505b] p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Welcome back, {userName}
            </h1>
            <p className="text-[#119da4]/80">Manage your preferences and explore your interests</p>
          </div>
          <div className="flex gap-2 sm:gap-4 mt-4 md:mt-0">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#119da4] text-white rounded-xl hover:bg-[#0c7489] transition"
            >
              <Settings className="w-4 h-4" />
              Edit Categories
            </button>
            {/* <LogoutButton /> */}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

          <div className="bg-white/80 p-4 sm:p-6 rounded-2xl border border-white/20 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg sm:text-xl font-semibold text-[#13505b]">Profile Details</h2>
              <Edit2 className="w-5 h-5 text-[#119da4]" />
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-[#13505b]/60">Email</label>
                <p className="text-[#13505b]">user@example.com</p>
              </div>
              <div>
                <label className="text-sm text-[#13505b]/60">Member Since</label>
                <p className="text-[#13505b]">January 2024</p>
              </div>
            </div>
          </div>

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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveCategories} />
    </div>
  );
};

export default UserDashboard;
