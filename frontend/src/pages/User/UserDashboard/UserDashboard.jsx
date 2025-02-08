import { useEffect, useState } from "react";
import LogoutButton from "../../../components/LogoutButton";
import Modal from "../../../components/Modal";
import { Settings, Layout, Edit2, AlertCircle } from "lucide-react";

const UserDashboard = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState("User"); // You can fetch this from your auth context

  useEffect(() => {
    // Get stored categories from localStorage
    const storedCategories = localStorage.getItem("selectedCategories");
    if (storedCategories) {
      setSelectedCategories(JSON.parse(storedCategories));
    } else {
      setIsModalOpen(true);
    }
  }, []);

  const handleSaveCategories = (categories) => {
    setSelectedCategories(categories);
    localStorage.setItem("selectedCategories", JSON.stringify(categories));
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#13505b] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {userName}
            </h1>
            <p className="text-[#119da4]/80">
              Manage your preferences and explore your interests
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#119da4] text-white rounded-xl hover:bg-[#0c7489] transition-colors duration-300"
            >
              <Settings className="w-4 h-4" />
              Edit Categories
            </button>
            <LogoutButton />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Categories Card */}
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#13505b]">
                Your Categories
              </h2>
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

          {/* Profile Card */}
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#13505b]">
                Profile Details
              </h2>
              <Edit2 className="w-5 h-5 text-[#119da4]" />
            </div>
            <div className="space-y-4">
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

          {/* Stats Card */}
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-xl">
            <h2 className="text-xl font-semibold text-[#13505b] mb-4">
              Quick Stats
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#119da4]/10 rounded-xl">
                <p className="text-sm text-[#13505b]/60">Categories</p>
                <p className="text-2xl font-bold text-[#119da4]">
                  {selectedCategories.length}
                </p>
              </div>
              <div className="p-4 bg-[#119da4]/10 rounded-xl">
                <p className="text-sm text-[#13505b]/60">Last Updated</p>
                <p className="text-2xl font-bold text-[#119da4]">Today</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCategories}
      />
    </div>
  );
};

export default UserDashboard;