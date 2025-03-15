import  { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  Users, 
  ArrowLeft,
  FileText,
  User,
  CheckCircle,
  AlertCircle,
  Award
} from 'lucide-react';

const CompanyJobDetails = () => {
  const { job_id } = useParams();
  console.log(job_id)
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        // Get user information from localStorage
        const userType = localStorage.getItem('userType');
        const userId = localStorage.getItem('user_id');

        const response = await fetch(`http://localhost:5000/jobs/jobDetails/${job_id}`, {
            method: "POST",  // Keep it POST
            headers: { "Content-Type": "application/json" },
            credentials: "include", 
            body: JSON.stringify({ userId, userType }) // Remove job_id from body
          });

        setJobDetails(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Failed to load job details');
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [job_id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isJobExpired = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    return deadlineDate < now;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!jobDetails) {
    return null;
  }

  const { job, quotes, selectedFreelancer, agreement } = jobDetails;
  const expired = isJobExpired(job.deadline);
  const userType = localStorage.getItem('userType');
  const isCompanyOwner = userType === 'company' && job.company_id === parseInt(localStorage.getItem('company_id'));

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Jobs
        </button>

        {/* Job Header */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-8">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center">
                {job.company_profile_picture ? (
                  <img 
                    src={job.company_profile_picture} 
                    alt={job.company_name}
                    className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Briefcase className="h-8 w-8 text-blue-500" />
                  </div>
                )}
                <div className="ml-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{job.title}</h1>
                  <p className="text-gray-600">{job.company_name}</p>
                </div>
              </div>
              <div>
                <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                  expired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {expired ? 'Expired' : 'Active'}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 text-blue-600" />
                <span className="ml-2 text-gray-700">{job.category_name}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="ml-2 text-gray-700">Deadline: {formatDate(job.deadline)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="ml-2 text-gray-700">Posted: {formatDate(job.created_at)}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="ml-2 text-gray-700">{job.quotes_count} Quote{job.quotes_count !== 1 ? 's' : ''}</span>
              </div>
              {job.location && (
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span className="ml-2 text-gray-700">{job.location}</span>
                </div>
              )}
              {job.budget && (
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <span className="ml-2 text-gray-700">Budget: ${job.budget}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex">
                  <button
                    onClick={() => setActiveTab('description')}
                    className={`px-4 py-4 text-sm font-medium ${
                      activeTab === 'description'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Description
                  </button>
                  {isCompanyOwner && (
                    <button
                      onClick={() => setActiveTab('quotes')}
                      className={`px-4 py-4 text-sm font-medium ${
                        activeTab === 'quotes'
                          ? 'border-b-2 border-blue-600 text-blue-600'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Quotes ({quotes?.length || 0})
                    </button>
                  )}
                  {selectedFreelancer && (
                    <button
                      onClick={() => setActiveTab('selected')}
                      className={`px-4 py-4 text-sm font-medium ${
                        activeTab === 'selected'
                          ? 'border-b-2 border-blue-600 text-blue-600'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Selected Freelancer
                    </button>
                  )}
                  {agreement && (
                    <button
                      onClick={() => setActiveTab('agreement')}
                      className={`px-4 py-4 text-sm font-medium ${
                        activeTab === 'agreement'
                          ? 'border-b-2 border-blue-600 text-blue-600'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Agreement
                    </button>
                  )}
                </nav>
              </div>
              
              <div className="p-6">
                {activeTab === 'description' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
                    <div className="prose max-w-none text-gray-700">
                      {job.description}
                    </div>
                    
                    {job.requirements && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Requirements</h3>
                        <div className="prose max-w-none text-gray-700">
                          {job.requirements}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'quotes' && isCompanyOwner && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Quotes from Freelancers</h2>
                    
                    {quotes && quotes.length > 0 ? (
                      <div className="space-y-6">
                        {quotes.map((quote) => (
                          <div key={quote.quote_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                {quote.profile_picture ? (
                                  <img 
                                    src={quote.profile_picture} 
                                    alt={quote.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <User className="h-6 w-6 text-blue-500" />
                                  </div>
                                )}
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">{quote.name}</p>
                                  <div className="flex items-center">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                    <span className="text-xs text-gray-500">{quote.completed_jobs} completed jobs</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">${quote.price}</p>
                                <p className="text-xs text-gray-500">Quoted on {formatDate(quote.created_at)}</p>
                              </div>
                            </div>
                            
                            <div className="mt-3">
                              <p className="text-sm text-gray-700">{quote.message}</p>
                            </div>
                            
                            {!selectedFreelancer && !expired && (
                              <div className="mt-4 flex justify-end">
                                <button 
                                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  Select Freelancer
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No quotes received yet</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'selected' && selectedFreelancer && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Selected Freelancer</h2>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <div className="flex items-center">
                        {selectedFreelancer.profile_picture ? (
                          <img 
                            src={selectedFreelancer.profile_picture} 
                            alt={selectedFreelancer.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-8 w-8 text-blue-500" />
                          </div>
                        )}
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">{selectedFreelancer.name}</h3>
                          <p className="text-sm text-gray-600">{selectedFreelancer.email}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center">
                      <Award className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-sm text-gray-700">Selected on {formatDate(selectedFreelancer.created_at)}</span>
                      </div>
                      
                      {!agreement && isCompanyOwner && (
                        <div className="mt-6">
                          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                            Create Agreement
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'agreement' && agreement && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Agreement</h2>
                    
                    <div className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-blue-600 mr-2" />
                          <span className="text-lg font-medium text-gray-900">Agreement Details</span>
                        </div>
                        <div className={`px-3 py-1 text-xs font-medium rounded-full ${
                          agreement.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          agreement.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1)}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Amount</h3>
                          <p className="text-gray-900 font-medium">${agreement.amount}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                          <p className="text-gray-900">{formatDate(agreement.start_date)}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">End Date</h3>
                          <p className="text-gray-900">{formatDate(agreement.end_date)}</p>
                        </div>
                        
                        {agreement.terms && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Terms & Conditions</h3>
                            <p className="text-gray-700 whitespace-pre-line">{agreement.terms}</p>
                          </div>
                        )}
                      </div>
                      
                      {agreement.status === 'pending' && userType === 'freelancer' && (
                        <div className="mt-6 flex space-x-4">
                          <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                            Accept Agreement
                          </button>
                          <button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
                            Decline Agreement
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
                
                {userType === 'freelancer' && !expired && !selectedFreelancer && (
                  <button className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors mb-3">
                    Submit Quote
                  </button>
                )}
                
                {isCompanyOwner && !expired && (
                  <>
                    <button className="w-full px-4 py-2 bg-white border border-blue-600 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors mb-3">
                      Edit Job
                    </button>
                    <button className="w-full px-4 py-2 bg-white border border-red-600 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors">
                      Delete Job
                    </button>
                  </>
                )}
                
                <button className="w-full mt-3 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                  Share Job
                </button>
              </div>
              
              <hr className="border-gray-200" />
              
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h2>
                
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Job ID</h3>
                    <p className="text-gray-900">{job.job_id}</p>
                  </div>
                  
                  {job.job_type && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Job Type</h3>
                      <p className="text-gray-900">{job.job_type}</p>
                    </div>
                  )}
                  
                  {job.duration && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                      <p className="text-gray-900">{job.duration}</p>
                    </div>
                  )}
                  
                  {job.skills && job.skills.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Required Skills</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {job.skills.map((skill, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyJobDetails;