import {
  Building2,
  Camera,
  Check,
  Pencil,
  X,
  Briefcase,
  MapPin,
  Link,
  Mail,
  Phone,
} from "lucide-react";

const ProfileInfo = ({
  userData,
  editMode,
  tempData,
  handleEdit,
  handleCancel,
  handleChange,
  handleSave,
  triggerFileInput,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-24 sm:-mt-32 md:-mt-36 z-10">
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 transition-all">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center sm:items-start">
            <div className="relative group">
              <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full bg-blue-50 border-4 border-white overflow-hidden shadow-md transition-all">
                {userData.profile_picture ? (
                  <img
                    src={userData.profile_picture}
                    alt={userData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                    <Building2 className="w-16 h-16 text-blue-400" />
                  </div>
                )}
              </div>
              <button
                onClick={() => triggerFileInput("profile")}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                aria-label="Upload profile picture"
              >
                <Camera className="w-10 h-10 text-white" />
              </button>
            </div>

            {/* Stats Card (Mobile-Only) */}
            <div className="mt-5 bg-blue-50 rounded-lg p-4 w-full sm:hidden">
              <div className="flex justify-center text-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">35</div>
                  <div className="flex items-center justify-center text-blue-500 text-sm mt-1">
                    <Briefcase className="w-3.5 h-3.5 mr-1" />
                    <span>Completed Jobs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Info Section */}
          <div className="flex-1 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Name */}
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  {editMode.name ? (
                    <div className="flex items-center space-x-2 w-full">
                      <input
                        type="text"
                        value={tempData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className="bg-blue-50 text-blue-800 text-xl sm:text-2xl font-bold px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                      />
                      <button
                        onClick={() => handleSave("name")}
                        className="bg-green-100 text-green-600 p-1.5 rounded-full hover:bg-green-200 transition-colors"
                        aria-label="Save name"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleCancel("name")}
                        className="bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 transition-colors"
                        aria-label="Cancel edit"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-700">
                        {userData.name}
                      </h1>
                      <button
                        onClick={() => handleEdit("name")}
                        className="bg-blue-50 text-blue-500 p-1.5 rounded-full hover:bg-blue-100 transition-colors"
                        aria-label="Edit name"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Stats (Desktop) */}
              <div className="hidden sm:flex items-center">
                <div className="ml-4 pl-4 border-l border-blue-100">
                  <div className="text-4xl font-bold text-blue-600">35</div>
                  <div className="flex items-center text-blue-500 text-sm font-medium">
                    <Briefcase className="w-3.5 h-3.5 mr-1" />
                    <span>Completed Jobs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-3">
              {editMode.bio ? (
                <div className="flex items-center space-x-2">
                  <textarea
                    value={tempData.bio || ""}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    placeholder="Add a bio"
                    className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg w-full min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  />
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => handleSave("bio")}
                      className="bg-green-100 text-green-600 p-1.5 rounded-full hover:bg-green-200 transition-colors"
                      aria-label="Save bio"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleCancel("bio")}
                      className="bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 transition-colors"
                      aria-label="Cancel edit"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start">
                  <p className="text-blue-600 text-base sm:text-lg flex-1">
                    {userData.bio ||
                      "Add a bio to tell people about your business"}
                  </p>
                  <button
                    onClick={() => handleEdit("bio")}
                    className="bg-blue-50 text-blue-500 p-1.5 rounded-full hover:bg-blue-100 transition-colors ml-2 flex-shrink-0"
                    aria-label="Edit bio"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center text-blue-600">
                <MapPin className="w-4 h-4 mr-2 text-blue-400" />
                <span>{userData.location || "Add location"}</span>
                <button
                  onClick={() => handleEdit("location")}
                  className="ml-2 text-blue-400 hover:text-blue-600 transition-colors"
                  aria-label="Edit location"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center text-blue-600">
                <Link className="w-4 h-4 mr-2 text-blue-400" />
                <span>{userData.website || "Add website"}</span>
                <button
                  onClick={() => handleEdit("website")}
                  className="ml-2 text-blue-400 hover:text-blue-600 transition-colors"
                  aria-label="Edit website"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center text-blue-600">
                <Mail className="w-4 h-4 mr-2 text-blue-400" />
                <span>{userData.email || "Add email"}</span>
                <button
                  onClick={() => handleEdit("email")}
                  className="ml-2 text-blue-400 hover:text-blue-600 transition-colors"
                  aria-label="Edit email"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
