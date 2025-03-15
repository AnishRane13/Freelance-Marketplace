import { useState, useEffect } from 'react';
import { Briefcase, Loader2, MapPin, Calendar, DollarSign, AlertCircle, Clock, ChevronDown, Send, CheckCircle, Tag, CreditCard, FileText } from 'lucide-react';
import { NotificationsContainer } from '../../../components/Notification'; 
import SubscriptionModal from '../../../components/Company/SubscriptionModal'; // We'll create this component next

const MAX_DESCRIPTION_LENGTH = 1000; // Maximum character limit for job description
const MIN_PRICE = 1; // Minimum price for the job

const CompanyCreateJob = () => {
  const companyId = localStorage.getItem("user_id");
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [deadline, setDeadline] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  // New states for subscription
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);

  const addNotification = (message, type = 'error') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    // Check subscription status first
    checkSubscriptionStatus();
    
    // Fetch categories
    fetchCategories();
    
    // Set minimum deadline to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = tomorrow.toISOString().split('T')[0];
    setDeadline(tomorrowFormatted);
  }, [companyId]);

  const checkSubscriptionStatus = async () => {
    setIsCheckingSubscription(true);
    try {
      const response = await fetch(`http://localhost:5000/subscription/active?company_id=${companyId}`);
      const data = await response.json();

      
      if (response.ok) {
        setHasActiveSubscription(data.hasActiveSubscription);
        if (data.hasActiveSubscription) {
          setSubscriptionData(data.subscription);
        } else {
          // Show subscription modal if no active subscription
          setShowSubscriptionModal(true);
        }
      } else {
        addNotification('Failed to check subscription status');
      }
    } catch (error) {
      addNotification('Error checking subscription status');
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`http://localhost:5000/categories/${companyId}`);
      const data = await response.json();
      if (response.ok && data.success) {
        setCategories(data.categories);
      } else {
        addNotification(data.error || 'Failed to fetch categories');
      }
    } catch (error) {
      addNotification('Error fetching categories');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user has active subscription before proceeding
    if (!hasActiveSubscription) {
      setShowSubscriptionModal(true);
      return;
    }
    
    // Validate inputs
    if (title.trim().length === 0) {
      addNotification('Job title cannot be empty');
      return;
    }
    
    if (description.trim().length === 0) {
      addNotification('Job description cannot be empty');
      return;
    }
    
    if (description.trim().length > MAX_DESCRIPTION_LENGTH) {
      addNotification(`Job description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`);
      return;
    }
    
    if (!selectedCategory) {
      addNotification('Please select a category');
      return;
    }
    
    if (!price || parseInt(price) < MIN_PRICE) {
      addNotification(`Price must be at least $${MIN_PRICE}`);
      return;
    }
    
    if (!location.trim()) {
      addNotification('Location cannot be empty');
      return;
    }
    
    if (!deadline) {
      addNotification('Please set a deadline');
      return;
    }
    
    setIsLoading(true);

    try {
      const jobData = {
        company_id: companyId,
        title: title.trim(),
        description: description.trim(),
        category_id: selectedCategory,
        price: parseInt(price),
        location: location.trim(),
        deadline: deadline,
        status: 'open',
        subscription_id: subscriptionData?.subscription_id
      };

      // console.log("jobData is here", jobData)

      const response = await fetch(`http://localhost:5000/jobs/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create job');
      }

      // Success: Add success notification
      addNotification('Job posted successfully', 'success');

      // Reset form
      setTitle('');
      setDescription('');
      setSelectedCategory('');
      setPrice('');
      setLocation('');
      
      // Reset deadline to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowFormatted = tomorrow.toISOString().split('T')[0];
      setDeadline(tomorrowFormatted);
      
      // Refresh subscription status after posting a job
      checkSubscriptionStatus();
      
    } catch (error) {
      addNotification(error.message || 'Failed to post job');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate days until deadline
  const getDaysUntilDeadline = () => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = Math.abs(deadlineDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDeadline = getDaysUntilDeadline();

  // Called after successful subscription purchase
  const handleSubscriptionPurchased = () => {
    checkSubscriptionStatus();
    setShowSubscriptionModal(false);
    addNotification('Subscription purchased successfully!', 'success');
  };

  return (
    <>
 <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-white min-h-screen font-sans">
        <div className="container mx-auto py-16 px-4">
          {/* Header */}
          <div className="mb-12 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center p-1.5 bg-blue-100 rounded-full mb-6">
              <div className="bg-blue-600 text-white p-2 rounded-full">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-700 bg-clip-text text-transparent mb-3">
              Post a New Job
            </h1>
            <p className="text-blue-600 text-lg">Create an engaging job posting to find the perfect talent</p>
          </div>

          {/* Main Content */}
          {!isCheckingSubscription && (
            <div className="max-w-3xl mx-auto">
              
              {/* Subscription Banner */}
              {hasActiveSubscription && subscriptionData && (
                <div className="mb-8 bg-white border-l-4 border-green-500 rounded-xl p-5 shadow-lg relative overflow-hidden">
                  <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-green-50 to-transparent opacity-70"></div>
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 text-green-600 p-2 rounded-full">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div className="relative z-10">
                      <h3 className="font-bold text-green-800 text-lg">Active Subscription</h3>
                      <div className="mt-1 flex items-center gap-5">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-green-600" />
                          <p className="text-green-700">
                            <span className="font-semibold">{subscriptionData.remaining_jobs}</span> job posts remaining
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-green-600" />
                          <p className="text-green-700">
                            Expires: {new Date(subscriptionData.expires_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* No Subscription Warning */}
              {!hasActiveSubscription && (
                <div className="mb-8 bg-white border-l-4 border-amber-500 rounded-xl p-6 shadow-lg relative overflow-hidden">
                  <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-amber-50 to-transparent opacity-70"></div>
                  <div className="flex items-start gap-4">
                    <div className="bg-amber-100 text-amber-600 p-2 rounded-full">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div className="relative z-10">
                      <h3 className="font-bold text-amber-800 text-lg">Subscription Required</h3>
                      <p className="text-amber-700 mt-1">You need an active subscription to post jobs.</p>
                      <button 
                        onClick={() => setShowSubscriptionModal(true)}
                        className="mt-3 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-md flex items-center gap-2 font-medium transition-all duration-300 hover:translate-y-[-2px]"
                      >
                        <CreditCard className="w-4 h-4" />
                        View Subscription Plans
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isCheckingSubscription && (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                  <p className="text-blue-600 font-medium">Checking your subscription status...</p>
                </div>
              )}

              {/* Job Form Card */}
              {!isCheckingSubscription && (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="px-8 pt-8 pb-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Job Details</h2>
                    <p className="text-gray-500 mt-1">All fields are required</p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="p-8">
                    <div className="space-y-8">
                      {/* Job Title */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label htmlFor="job-title" className="block text-sm font-semibold text-gray-700">
                            Job Title
                          </label>
                          <span className="text-xs text-blue-500">Make it descriptive</span>
                        </div>
                        <div className="relative group">
                          <input
                            id="job-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Website Development, Logo Design"
                            className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 group-hover:border-blue-300"
                            required
                            maxLength={255}
                          />
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            {/* <FileText className="w-5 h-5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" /> */}
                          </div>
                        </div>
                      </div>

                      {/* Job Description */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label htmlFor="job-description" className="block text-sm font-semibold text-gray-700">
                            Job Description
                          </label>
                          <span className="text-xs text-blue-500">Be specific about requirements</span>
                        </div>
                        <div className="relative">
                          <textarea
                            id="job-description"
                            value={description}
                            onChange={(e) => {
                              if (e.target.value.length <= MAX_DESCRIPTION_LENGTH) {
                                setDescription(e.target.value);
                              }
                            }}
                            placeholder="Describe job requirements, deliverables, and other important details"
                            className="w-full min-h-40 p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-y placeholder-gray-400"
                            required
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-500">Use markdown for formatting</div>
                          <div className="text-xs">
                            <span className={description.length > MAX_DESCRIPTION_LENGTH * 0.8 ? "text-amber-500 font-medium" : "text-gray-500"}>
                              {description.length}
                            </span>
                            <span className="text-gray-400"> / {MAX_DESCRIPTION_LENGTH}</span>
                          </div>
                        </div>
                      </div>

                      {/* Two Column Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Category Selection */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label htmlFor="job-category" className="block text-sm font-semibold text-gray-700">
                              Category
                            </label>
                          </div>
                          <div className="relative">
                            <select
                              id="job-category"
                              value={selectedCategory}
                              onChange={(e) => setSelectedCategory(e.target.value)}
                              className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all duration-300"
                              required
                            >
                              <option value="">Select Category</option>
                              {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400">
                              <ChevronDown className="w-5 h-5" />
                            </div>
                          </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label htmlFor="job-location" className="block text-sm font-semibold text-gray-700">
                              Location
                            </label>
                          </div>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <MapPin className="w-5 h-5 text-blue-500" />
                            </div>
                            <input
                              id="job-location"
                              type="text"
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                              placeholder="e.g. Remote, New York, London"
                              className="w-full p-4 pl-12 bg-gray-50 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-400"
                              required
                              maxLength={150}
                            />
                          </div>
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label htmlFor="job-price" className="block text-sm font-semibold text-gray-700">
                              Budget ($)
                            </label>
                            <span className="text-xs text-blue-500">Min: ${MIN_PRICE}</span>
                          </div>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <DollarSign className="w-5 h-5 text-blue-500" />
                            </div>
                            <input
                              id="job-price"
                              type="number"
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                              placeholder="Enter amount"
                              min={MIN_PRICE}
                              className="w-full p-4 pl-12 bg-gray-50 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-400"
                              required
                            />
                          </div>
                        </div>

                        {/* Deadline */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label htmlFor="job-deadline" className="block text-sm font-semibold text-gray-700">
                              Deadline
                            </label>
                          </div>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Calendar className="w-5 h-5 text-blue-500" />
                            </div>
                            <input
                              id="job-deadline"
                              type="date"
                              value={deadline}
                              onChange={(e) => setDeadline(e.target.value)}
                              className="w-full p-4 pl-12 bg-gray-50 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                              required
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                          {daysUntilDeadline && (
                            <div className="text-xs text-blue-500 flex items-center mt-1">
                              <Clock className="w-3.5 h-3.5 mr-1" />
                              {daysUntilDeadline === 1
                                ? 'Due tomorrow'
                                : `Due in ${daysUntilDeadline} days`}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="pt-6 border-t border-gray-100">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                          <p className="text-sm text-gray-500">
                            By posting, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
                          </p>
                          <button
                            type="submit"
                            disabled={isLoading || !hasActiveSubscription}
                            className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-md disabled:opacity-70 flex items-center justify-center gap-2 font-medium transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px]"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Posting Job...
                              </>
                            ) : (
                              <>
                                <Send className="w-5 h-5" />
                                Publish Job
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <SubscriptionModal 
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          onSubscriptionPurchased={handleSubscriptionPurchased}
          companyId={companyId}
        />
      )}

      <NotificationsContainer 
        notifications={notifications} 
        removeNotification={removeNotification} 
      />
      </>
  );
};

export default CompanyCreateJob;