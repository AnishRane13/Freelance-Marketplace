import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { User, Mail, Calendar, MapPin, Globe, FileText, Layout } from "lucide-react";

const UserProfile = () => {
  const { user_id } = useParams();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5000/users/${user_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        if (data.success) {
          setUserData(data.user);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user_id) {
      fetchUserData();
    }
  }, [user_id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#13505b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-[#13505b] flex items-center justify-center text-white">
        User not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#13505b] p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="relative mb-6">
          <div className="h-48 sm:h-64 rounded-2xl overflow-hidden">
            {userData.cover_photo ? (
              <img 
                src={userData.cover_photo} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#0c7489]" />
            )}
          </div>
          
          <div className="absolute -bottom-16 left-4 sm:left-8">
            <div className="w-32 h-32 rounded-full border-4 border-[#13505b] overflow-hidden bg-[#119da4]">
              {userData.profile_picture ? (
                <img 
                  src={userData.profile_picture} 
                  alt={userData.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-full h-full p-6 text-white" />
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white/80 rounded-2xl p-6 shadow-lg">
              <h1 className="text-2xl font-bold text-[#13505b] mb-2">{userData.name}</h1>
              {userData.bio && (
                <p className="text-[#040404]/80 mb-4">{userData.bio}</p>
              )}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#0c7489]">
                  <Mail className="w-4 h-4" />
                  <span>{userData.email}</span>
                </div>
                <div className="flex items-center gap-2 text-[#0c7489]">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(userData.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}</span>
                </div>
                {userData.location && (
                  <div className="flex items-center gap-2 text-[#0c7489]">
                    <MapPin className="w-4 h-4" />
                    <span>{userData.location}</span>
                  </div>
                )}
                {userData.website && (
                  <div className="flex items-center gap-2 text-[#0c7489]">
                    <Globe className="w-4 h-4" />
                    <a href={userData.website} target="_blank" rel="noopener noreferrer" 
                       className="hover:text-[#119da4] transition-colors">
                      {userData.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Description Card */}
            {userData.description && (
              <div className="bg-white/80 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-[#119da4]" />
                  <h2 className="text-lg font-semibold text-[#13505b]">About</h2>
                </div>
                <p className="text-[#040404]/80 whitespace-pre-wrap">{userData.description}</p>
              </div>
            )}
          </div>

          {/* Right Column - Categories */}
          <div className="space-y-6">
            <div className="bg-white/80 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Layout className="w-5 h-5 text-[#119da4]" />
                <h2 className="text-lg font-semibold text-[#13505b]">Categories</h2>
              </div>
              {userData.categories && userData.categories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {userData.categories.map((category, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[#119da4]/10 text-[#119da4] rounded-full text-sm font-medium"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[#040404]/60">No categories selected</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;