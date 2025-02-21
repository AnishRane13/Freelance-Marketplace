import React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {Building2,Camera,Check,Pencil,Plus,Upload,X,} from "lucide-react";
import CreatePost from "../../../components/CreatePost";

const UserProfile = () => {
  const { user_id } = useParams();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState({});
  const [tempData, setTempData] = useState({});
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5000/users/${user_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (data.success) {
          setUserData(data.user);
          setTempData(data.user);
        } else {
          setError("Failed to load user data");
          showToast("error", "Failed to load user data");
        }
      } catch (error) {
        setError("Error connecting to server");
        showToast("error", "Error connecting to server");
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user_id) {
      fetchUserData();
    }
  }, [user_id]);

  const showToast = (type, message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const handleImageUpload = async (type, event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    formData.append(
      "type",
      type === "profile" ? "profile_picture" : "cover_photo"
    );

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/users/${user_id}/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setUserData((prev) => ({
          ...prev,
          [type === "profile" ? "profile_picture" : "cover_photo"]: data.url,
        }));
        showToast("success", "Image uploaded successfully");
      } else {
        showToast("error", "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      showToast("error", "Error uploading image");
    }
  };

  const handleEdit = (field) => {
    setEditMode((prev) => ({ ...prev, [field]: true }));
    setTempData((prev) => ({ ...prev, [field]: userData[field] }));
  };

  const handleCancel = (field) => {
    setEditMode((prev) => ({ ...prev, [field]: false }));
    setTempData((prev) => ({ ...prev, [field]: userData[field] }));
  };

  const handleChange = (field, value) => {
    setTempData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (field) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/users/${user_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [field]: tempData[field] }),
      });

      const data = await response.json();

      if (data.success) {
        setUserData((prev) => ({ ...prev, [field]: tempData[field] }));
        setEditMode((prev) => ({ ...prev, [field]: false }));
        showToast("success", "Updated successfully");
      } else {
        showToast("error", "Failed to update");
      }
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      showToast("error", "Error updating field");
    }
  };

  const fileInputRef = React.useRef(null);

  const triggerFileInput = (type) => {
    fileInputRef.current.setAttribute("data-type", type);
    fileInputRef.current.click();
  };

  const handleFileInputChange = (event) => {
    const type = event.target.getAttribute("data-type");
    handleImageUpload(type, event);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#13505b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#119da4] border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#13505b] flex items-center justify-center">
        <div className="text-white text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#13505b]">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileInputChange}
      />

      {/* Header Section */}
      <div className="relative h-80">
        {/* Cover Photo */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c7489] to-[#119da4] overflow-hidden group">
          {userData.cover_photo ? (
            <img
              src={userData.cover_photo}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <button
              onClick={() => triggerFileInput("cover")}
              className="absolute inset-0 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <Upload className="w-12 h-12" />
              <span className="ml-2 text-lg">Upload Cover Photo</span>
            </button>
          )}
          <button
            onClick={() => triggerFileInput("cover")}
            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
          >
            <Camera className="w-16 h-16 text-white" />
          </button>
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setShowCreatePost(true)}
              className="px-4 py-2 bg-[#119da4] text-white rounded-lg hover:bg-[#0c7489] transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Post
            </button>
          </div>
        </div>

        {/* Profile Section */}
        <div className="absolute -bottom-16 left-8 flex items-end space-x-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-xl bg-[#119da4] border-4 border-[#ffffff] overflow-hidden">
              {userData.profile_picture ? (
                <img
                  src={userData.profile_picture}
                  alt={userData.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 className="w-16 h-16 text-white" />
                </div>
              )}
            </div>
            <button
              onClick={() => triggerFileInput("profile")}
              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
            >
              <Camera className="w-8 h-8 text-white" />
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center space-x-4">
              {editMode.name ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={tempData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="bg-white/90 text-[#13505b] text-2xl font-bold px-3 py-1 rounded"
                  />
                  <button
                    onClick={() => handleSave("name")}
                    className="text-green-400 hover:text-green-500"
                  >
                    <Check className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => handleCancel("name")}
                    className="text-red-400 hover:text-red-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-white">
                    {userData.name}
                  </h1>
                  <button
                    onClick={() => handleEdit("name")}
                    className="text-white/70 hover:text-white"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {editMode.bio ? (
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="text"
                  value={tempData.bio || ""}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  placeholder="Add a bio"
                  className="bg-white/90 text-[#13505b] px-3 py-1 rounded w-full"
                />
                <button
                  onClick={() => handleSave("bio")}
                  className="text-green-400 hover:text-green-500"
                >
                  <Check className="w-6 h-6" />
                </button>
                <button
                  onClick={() => handleCancel("bio")}
                  className="text-red-400 hover:text-red-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 mt-2">
                <p className="text-white/90">
                  {userData.bio || "Add a bio to tell people about your user"}
                </p>
                <button
                  onClick={() => handleEdit("bio")}
                  className="text-white/70 hover:text-white"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8"></div>
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-2 rounded-lg shadow-lg text-white ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {showCreatePost && (
        <CreatePost userId={user_id} onClose={() => setShowCreatePost(false)} />
      )}
    </div>
  );
};

export default UserProfile;