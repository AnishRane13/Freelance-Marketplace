import { useState, useEffect } from 'react';
import { Briefcase, Loader2, MapPin, Calendar, DollarSign } from 'lucide-react';
import { NotificationsContainer } from '../Notification'; 

const MAX_DESCRIPTION_LENGTH = 1000; // Maximum character limit for job description
const MIN_PRICE = 1; // Minimum price for the job

const CreateJob = () => {
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

  const addNotification = (message, type = 'error') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    // Fetch categories
    fetchCategories();
    
    // Set minimum deadline to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = tomorrow.toISOString().split('T')[0];
    setDeadline(tomorrowFormatted);
  }, [companyId]);

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
        status: 'open'
      };

      const response = await fetch(`http://localhost:5000/jobs`, {
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

  return (
    <>
      <div className="bg-white min-h-screen">
        <div className="container mx-auto py-8 px-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2 mb-4">
              <Briefcase className="w-6 h-6" />
              Post a New Job
            </h1>
            <div className="w-full h-1 bg-blue-100 rounded"></div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl border border-blue-200 shadow-md max-w-3xl mx-auto">
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Job Title */}
                <div>
                  <label htmlFor="job-title" className="block text-sm font-medium text-blue-800 mb-1">
                    Job Title
                  </label>
                  <input
                    id="job-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Website Development, Logo Design"
                    className="w-full p-3 bg-white rounded-lg border-2 border-blue-300 text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                    maxLength={255}
                  />
                </div>

                {/* Job Description */}
                <div>
                  <label htmlFor="job-description" className="block text-sm font-medium text-blue-800 mb-1">
                    Job Description
                  </label>
                  <textarea
                    id="job-description"
                    value={description}
                    onChange={(e) => {
                      if (e.target.value.length <= MAX_DESCRIPTION_LENGTH) {
                        setDescription(e.target.value);
                      }
                    }}
                    placeholder="Describe job requirements, deliverables, and other important details"
                    className="w-full min-h-32 p-4 bg-white rounded-lg border-2 border-blue-300 text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-y"
                    required
                  />
                  <div className="text-sm text-gray-500 text-right mt-1">
                    {description.length} / {MAX_DESCRIPTION_LENGTH}
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label htmlFor="job-category" className="block text-sm font-medium text-blue-800 mb-1">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      id="job-category"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full p-3 pl-4 pr-10 bg-white rounded-lg border-2 border-blue-300 text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all duration-200"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-blue-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Two Column Layout for Price and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Price */}
                  <div>
                    <label htmlFor="job-price" className="block text-sm font-medium text-blue-800 mb-1">
                      Budget ($)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <DollarSign className="w-5 h-5 text-blue-500" />
                      </div>
                      <input
                        id="job-price"
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Enter amount"
                        min={MIN_PRICE}
                        className="w-full p-3 pl-10 bg-white rounded-lg border-2 border-blue-300 text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label htmlFor="job-location" className="block text-sm font-medium text-blue-800 mb-1">
                      Location
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <MapPin className="w-5 h-5 text-blue-500" />
                      </div>
                      <input
                        id="job-location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Remote, New York, London"
                        className="w-full p-3 pl-10 bg-white rounded-lg border-2 border-blue-300 text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                        maxLength={150}
                      />
                    </div>
                  </div>
                </div>

                {/* Deadline */}
                <div>
                  <label htmlFor="job-deadline" className="block text-sm font-medium text-blue-800 mb-1">
                    Deadline
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Calendar className="w-5 h-5 text-blue-500" />
                    </div>
                    <input
                      id="job-deadline"
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full p-3 pl-10 bg-white rounded-lg border-2 border-blue-300 text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  {daysUntilDeadline && (
                    <div className="mt-1 text-sm text-blue-500">
                      {daysUntilDeadline === 1
                        ? 'Due tomorrow'
                        : `Due in ${daysUntilDeadline} days`}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full md:w-auto float-right px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:opacity-70 flex items-center justify-center gap-2 font-medium"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Posting Job...
                      </>
                    ) : (
                      'Post Job'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <NotificationsContainer 
        notifications={notifications} 
        removeNotification={removeNotification} 
      />
    </>
  );
};

export default CreateJob;