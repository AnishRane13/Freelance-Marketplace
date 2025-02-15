import React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Globe,
  FileText,
  Layout,
  Building2,
  Pencil,
  Check,
  X,
  Upload,
  Camera,
  Plus,
} from "lucide-react";

const CompanyDashboard = () => {
  const { user_id } = useParams();
  const [companyData, setCompanyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState({});
  const [tempData, setTempData] = useState({});
  const [toasts, setToasts] = useState([]);

  const categoryMap = {
    1: "Technology",
    2: "Marketing",
    3: "Design",
    4: "Development",
    5: "Writing",
    6: "Business",
    7: "Customer Service",
    8: "Sales",
    9: "Finance",
    10: "Project Management",
  };

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5000/users/${user_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (data.success) {
          setCompanyData(data.user);
          setTempData(data.user);
        } else {
          setError("Failed to load company data");
          showToast("error", "Failed to load company data");
        }
      } catch (error) {
        setError("Error connecting to server");
        showToast("error", "Error connecting to server");
        console.error("Error fetching company data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user_id) {
      fetchCompanyData();
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
        setCompanyData((prev) => ({
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
    setTempData((prev) => ({ ...prev, [field]: companyData[field] }));
  };

  const handleCancel = (field) => {
    setEditMode((prev) => ({ ...prev, [field]: false }));
    setTempData((prev) => ({ ...prev, [field]: companyData[field] }));
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
        setCompanyData((prev) => ({ ...prev, [field]: tempData[field] }));
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

  // File input ref for image uploads
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
          {companyData.cover_photo ? (
            <img
              src={companyData.cover_photo}
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
        </div>

        {/* Profile Section */}
        <div className="absolute -bottom-16 left-8 flex items-end space-x-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-xl bg-[#119da4] border-4 border-[#ffffff] overflow-hidden">
              {companyData.profile_picture ? (
                <img
                  src={companyData.profile_picture}
                  alt={companyData.name}
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
                    {companyData.name}
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
                  {companyData.bio ||
                    "Add a bio to tell people about your company"}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Contact Info */}
          <div className="space-y-6">
            <div className="bg-white/90 rounded-xl p-6 backdrop-blur-sm">
              <h2 className="text-[#13505b] font-semibold text-lg mb-4">
                Contact Information
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-[#0c7489]">
                    <Mail className="w-5 h-5" />
                    <span>{companyData.email}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-[#0c7489]">
                    <MapPin className="w-5 h-5" />
                    {editMode.location ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={tempData.location || ""}
                          onChange={(e) =>
                            handleChange("location", e.target.value)
                          }
                          placeholder="Add location"
                          className="bg-white text-[#13505b] px-3 py-1 rounded"
                        />
                        <button onClick={() => handleSave("location")}>
                          <Check className="w-5 h-5 text-green-500" />
                        </button>
                        <button onClick={() => handleCancel("location")}>
                          <X className="w-5 h-5 text-red-500" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span>{companyData.location || "Add location"}</span>
                        <button onClick={() => handleEdit("location")}>
                          <Pencil className="w-4 h-4 text-[#119da4]" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-[#0c7489]">
                    <Globe className="w-5 h-5" />
                    {editMode.website ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={tempData.website || ""}
                          onChange={(e) =>
                            handleChange("website", e.target.value)
                          }
                          placeholder="Add website"
                          className="bg-white text-[#13505b] px-3 py-1 rounded"
                        />
                        <button onClick={() => handleSave("website")}>
                          <Check className="w-5 h-5 text-green-500" />
                        </button>
                        <button onClick={() => handleCancel("website")}>
                          <X className="w-5 h-5 text-red-500" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span>{companyData.website || "Add website"}</span>
                        <button onClick={() => handleEdit("website")}>
                          <Pencil className="w-4 h-4 text-[#119da4]" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-[#0c7489]">
                  <Calendar className="w-5 h-5" />
                  <span>
                    Joined{" "}
                    {new Date(companyData.created_at).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Categories Section (continuing from previous code) */}
            <div className="bg-white/90 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[#13505b] font-semibold text-lg">
                  Expertise Areas
                </h2>
                <button
                  onClick={() => handleEdit("categories")}
                  className="text-[#119da4] hover:text-[#0c7489]"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>

              {editMode.categories ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(categoryMap).map(([id, name]) => (
                      <button
                        key={id}
                        onClick={() => {
                          const categories = tempData.categories || [];
                          const numId = parseInt(id);
                          if (categories.includes(numId)) {
                            handleChange(
                              "categories",
                              categories.filter((c) => c !== numId)
                            );
                          } else {
                            handleChange("categories", [...categories, numId]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          (tempData.categories || []).includes(parseInt(id))
                            ? "bg-[#119da4] text-white"
                            : "bg-[#119da4]/10 text-[#0c7489]"
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleSave("categories")}
                      className="px-4 py-2 bg-[#119da4] text-white rounded-lg hover:bg-[#0c7489] transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleCancel("categories")}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(companyData.categories || []).map((categoryId) => (
                    <span
                      key={categoryId}
                      className="px-3 py-1.5 bg-[#119da4]/10 text-[#0c7489] rounded-lg text-sm font-medium"
                    >
                      {categoryMap[categoryId]}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - About */}
          <div className="md:col-span-2">
            <div className="bg-white/90 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[#13505b] font-semibold text-lg">About</h2>
                <button
                  onClick={() => handleEdit("description")}
                  className="text-[#119da4] hover:text-[#0c7489]"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>

              {editMode.description ? (
                <div className="space-y-3">
                  <textarea
                    value={tempData.description || ""}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    placeholder="Tell people about your company..."
                    className="w-full h-48 p-3 bg-white rounded-lg border border-[#119da4] text-[#13505b] focus:outline-none focus:ring-2 focus:ring-[#119da4]"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleSave("description")}
                      className="px-4 py-2 bg-[#119da4] text-white rounded-lg hover:bg-[#0c7489] transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleCancel("description")}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-[#040404]/80">
                  {companyData.description || (
                    <div className="space-y-4">
                      <p>
                        Welcome to {companyData.name}! We specialize in
                        delivering innovative solutions across multiple domains
                        including{" "}
                        {(companyData.categories || [])
                          .map((id) => categoryMap[id])
                          .slice(0, 3)
                          .join(", ")}
                        , and more.
                      </p>
                      <p>
                        Click the edit button to add a detailed description
                        about your company, including your mission, values, and
                        what makes your organization unique.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Projects/Portfolio Section */}
            <div className="mt-6 bg-white/90 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[#13505b] font-semibold text-lg">
                  Portfolio Highlights
                </h2>
                <button className="px-4 py-2 bg-[#119da4] text-white rounded-lg hover:bg-[#0c7489] transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Project
                </button>
              </div>

              {companyData.projects && companyData.projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {companyData.projects.map((project, index) => (
                    <div
                      key={index}
                      className="border border-[#119da4]/20 rounded-lg p-4"
                    >
                      <h3 className="text-[#13505b] font-medium mb-2">
                        {project.title}
                      </h3>
                      <p className="text-[#040404]/70 text-sm">
                        {project.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[#040404]/60">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-[#119da4]" />
                  <p>No projects added yet.</p>
                  <p className="text-sm">
                    Showcase your work by adding portfolio items.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
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
    </div>
  );
};

export default CompanyDashboard;
