import { Camera, Upload, Plus } from "lucide-react";

const ProfileHeader = ({ userData, triggerFileInput, children }) => {
  return (
    <div className="relative h-56 sm:h-64 md:h-80 lg:h-96">
      {/* Cover Photo */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 overflow-hidden group">
        {userData.cover_photo ? (
          <>
            <img
              src={userData.cover_photo}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center">
            <Upload className="w-12 h-12 sm:w-16 sm:h-16 text-white/80" />
            <span className="mt-3 text-base sm:text-lg font-medium text-white/90">Upload Cover Photo</span>
            <button
              onClick={() => triggerFileInput("cover")}
              className="mt-3 px-4 py-1.5 sm:px-5 sm:py-2 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-sm transition-colors shadow-md"
            >
              Choose Image
            </button>
          </div>
        )}
        
        <button
          onClick={() => triggerFileInput("cover")}
          className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Change cover photo"
        >
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
            <Camera className="w-8 h-8 text-white" />
          </div>
        </button>
        
        {/* Action Button */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
          {children}
        </div>
        
        {/* Decorative bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent"></div>
      </div>
    </div>
  );
};

export default ProfileHeader;