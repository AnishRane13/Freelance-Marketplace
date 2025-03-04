import React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Plus } from "lucide-react";
import ProfileHeader from "../../../components/User/UserProfile/ProfileHeader";
import ProfileInfo from "../../../components/User/UserProfile/ProfileInfo";
import UserPosts from "../../../components/User/UserProfile/UserPosts";
import { NotificationsContainer } from "../../../components/Notification";
import CreatePost from "../../../components/CreatePost";
import Loader from "../../../components/Loader";

const CompanyProfile = () => {
  const { user_id } = useParams();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState({});
  const [tempData, setTempData] = useState({});
  const [notifications, setNotifications] = useState([]);
  const fileInputRef = React.useRef(null);

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
          showNotification("error", "Failed to load user data");
        }
      } catch (error) {
        setError("Error connecting to server");
        showNotification("error", "Error connecting to server");
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user_id) {
      fetchUserData();
    }
  }, [user_id]);

  const showNotification = (type, message) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, type, message }]);
    // Auto-removal is handled by the notification component itself
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
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
        showNotification("success", "Image uploaded successfully");
      } else {
        showNotification("error", "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      showNotification("error", "Error uploading image");
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
        showNotification("success", "Updated successfully");
      } else {
        showNotification("error", "Failed to update");
      }
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      showNotification("error", "Error updating field");
    }
  };

  const triggerFileInput = (type) => {
    fileInputRef.current.setAttribute("data-type", type);
    fileInputRef.current.click();
  };

  const handleFileInputChange = (event) => {
    const type = event.target.getAttribute("data-type");
    handleImageUpload(type, event);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-blue-700 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileInputChange}
      />

      {/* Header Section */}
      <ProfileHeader 
        userData={userData} 
        triggerFileInput={triggerFileInput}
      >
  
      </ProfileHeader>

      {/* Profile Info Section */}
      <ProfileInfo 
        userData={userData}
        editMode={editMode}
        tempData={tempData}
        handleEdit={handleEdit}
        handleCancel={handleCancel}
        handleChange={handleChange}
        handleSave={handleSave}
        triggerFileInput={triggerFileInput}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Content will go here */}
        </div>
      </div>
          <UserPosts userId={user_id} />

      {/* Notifications */}
      <NotificationsContainer 
        notifications={notifications} 
        removeNotification={removeNotification} 
      />

    </div>
  );
};

export default CompanyProfile;