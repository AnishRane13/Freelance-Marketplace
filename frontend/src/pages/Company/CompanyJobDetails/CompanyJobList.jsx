import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, Clock, CalendarDays, Plus, Edit, Trash2, Eye } from 'lucide-react';

const JobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch jobs logic here
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      // Fetch jobs from your API
      const response = await fetch('/api/jobs/company');
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleCreateJob = () => {
    navigate('/jobs/create');
  };

  const handleViewDetails = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (expired) => {
    return expired 
      ? { bg: 'bg-red-100', text: 'text-red-800' } 
      : { bg: 'bg-green-100', text: 'text-green-800' };
  };

  // Filter jobs based on active filter
  const filteredJobs = jobs.filter(job => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return !job.expired;
    if (activeFilter === 'expired') return job.expired;
    return true;
  });

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Company Jobs</h1>
            <p className="mt-2 text-gray-600">
              Manage and track all your posted job listings
            </p>
          </div>
          <button 
            onClick={handleCreateJob}
            className="mt-4 md:mt-0 inline-flex items-center px-5 py-3 rounded-lg shadow-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Job
          </button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center">
              <Briefcase className="h-6 w-6 text-blue-600" />
              <span className="ml-2 text-blue-800 font-semibold text-lg">
                {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'} Posted
              </span>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeFilter === 'all' 
                    ? 'bg-white shadow-sm text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('active')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeFilter === 'active' 
                    ? 'bg-white shadow-sm text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setActiveFilter('expired')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeFilter === 'expired' 
                    ? 'bg-white shadow-sm text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Expired
              </button>
            </div>
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md text-center py-16">
            <Briefcase className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-xl font-medium text-gray-900">No {activeFilter !== 'all' ? activeFilter : ''} jobs found</h3>
            <p className="mt-2 text-gray-500 max-w-md mx-auto">
              {activeFilter === 'all' 
                ? "You haven't posted any jobs yet. Get started by creating your first job listing."
                : activeFilter === 'active'
                  ? "You don't have any active job listings at the moment."
                  : "You don't have any expired job listings at the moment."
              }
            </p>
            {activeFilter === 'all' && (
              <div className="mt-8">
                <button 
                  onClick={handleCreateJob}
                  className="inline-flex items-center px-5 py-2.5 rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create New Job
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {filteredJobs.map((job) => {
              const statusColor = getStatusColor(job.expired);
              return (
                <div 
                  key={job.job_id} 
                  className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 border ${job.expired ? 'border-red-100' : 'border-blue-100'}`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-semibold text-gray-900 truncate">{job.title}</h3>
                      <div 
                        className={`px-3 py-1 text-xs font-medium rounded-full ${statusColor.bg} ${statusColor.text}`}
                      >
                        {job.expired ? 'Expired' : 'Active'}
                      </div>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <div className="flex items-center bg-gray-50 px-3 py-1 rounded-full">
                        <Briefcase className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <span>{job.category_name}</span>
                      </div>
                      <div className="flex items-center bg-gray-50 px-3 py-1 rounded-full">
                        <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <span>{Number(job.quotes_count)} Quote{Number(job.quotes_count) !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    
                    <p className="mt-4 text-gray-600 line-clamp-2">
                      {job.description}
                    </p>
                    
                    <div className="mt-5 flex flex-wrap gap-2">
                      <div className="flex items-center px-3 py-1.5 bg-blue-50 rounded-full text-xs text-blue-700">
                        <Clock className="h-3 w-3 mr-1.5 text-blue-500" />
                        Posted: {formatDate(job.created_at)}
                      </div>
                      <div className={`flex items-center px-3 py-1.5 rounded-full text-xs ${job.expired ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        <CalendarDays className="h-3 w-3 mr-1.5" />
                        Deadline: {formatDate(job.deadline)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-100">
                    <div className="flex space-x-3">
                      {!job.expired && (
                        <button className="inline-flex items-center px-3.5 py-2 border border-blue-600 text-sm font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 transition-colors duration-200">
                          <Edit className="h-4 w-4 mr-1.5" />
                          Edit
                        </button>
                      )}
                      {!job.expired ? (
                        <button className="inline-flex items-center px-3.5 py-2 border border-red-600 text-sm font-medium rounded-lg text-red-600 bg-white hover:bg-red-50 transition-colors duration-200">
                          <Trash2 className="h-4 w-4 mr-1.5" />
                          Delete
                        </button>
                      ) : (
                        <span></span>
                      )}
                    </div>
                    <button 
                      onClick={() => handleViewDetails(job.job_id)}
                      className="inline-flex items-center px-3.5 py-2 rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
                    >
                      <Eye className="h-4 w-4 mr-1.5" />
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsList;