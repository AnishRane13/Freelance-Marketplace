import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../LoadingSpinner";
import { motion } from "framer-motion";

const UserAgreementsContent = ({ user_id }) => {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAgreements = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/getAllAgreements/${user_id}`);
        const data = await response.json();

        if (response.ok) {
          setAgreements(data.agreements || []);
          setError(null);
        } else {
          throw new Error(data.error || "Failed to fetch agreements");
        }
      } catch (err) {
        console.error("Error fetching agreements:", err);
        setError("Failed to load agreements. Please try again later.");
        setAgreements([]);
      } finally {
        setLoading(false);
      }
    };

    if (user_id) {
      fetchAgreements();
    }
  }, [user_id]);

  // Handle navigation to agreement details
  const handleViewDetails = (agreementId) => {
    navigate(`/agreements/${agreementId}`);
  };

  // Format date to a readable string
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format deadline with time remaining
  const formatDeadline = (deadline) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} days`;
    } else if (diffDays === 0) {
      return "Due today";
    } else if (diffDays === 1) {
      return "Due tomorrow";
    } else {
      return `${diffDays} days remaining`;
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Get status badge styles
  const getStatusBadgeStyles = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'canceled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Agreements</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center font-medium shadow-sm">
          {error}
        </div>
      ) : agreements.length === 0 ? (
        <div className="bg-white bg-opacity-70 rounded-xl shadow-md p-6 text-center py-16">
          <h3 className="text-xl font-medium text-gray-800 mb-2">No Agreements Yet</h3>
          <p className="text-gray-600">You haven't accepted any job offers yet.</p>
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {agreements.map((agreement) => (
            <motion.div 
              key={agreement.agreement_id} 
              variants={itemVariants}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white px-6 py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{agreement.job_title}</h3>
                    <p className="text-gray-500 text-sm">{formatDate(agreement.created_at)}</p>
                  </div>
                  <div className="flex items-center">
                    {agreement.company_profile_picture ? (
                      <img 
                        src={agreement.company_profile_picture} 
                        alt={agreement.company_name}
                        className="w-8 h-8 rounded-full object-cover mr-2"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
                        <span className="text-gray-500 text-xs font-bold">
                          {agreement.company_name?.charAt(0).toUpperCase() || 'C'}
                        </span>
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700">{agreement.company_name}</span>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-700 font-medium">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeStyles(agreement.status)}`}>
                    {agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-700 font-medium">Payment:</span>
                  <span className="text-blue-600 font-semibold">${agreement.quote_price}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Deadline:</span>
                  <div className="text-right">
                    <span className="text-sm text-gray-600 block">{formatDate(agreement.deadline)}</span>
                    <span className={`text-xs ${
                      new Date(agreement.deadline) < new Date() ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {formatDeadline(agreement.deadline)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex space-x-3">
                <button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  onClick={() => handleViewDetails(agreement.agreement_id)}
                >
                  View Details
                </button>
                {agreement.status.toLowerCase() === 'active' && (
                  <button className="flex-1 border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-md transition-colors">
                    Submit Work
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default UserAgreementsContent;