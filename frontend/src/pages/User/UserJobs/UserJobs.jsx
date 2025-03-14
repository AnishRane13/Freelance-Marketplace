import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import JobCard from "../../../components/User/UserJobs/JobCard";
import CategoryFilter from "../../../components/User/UserJobs/CategoryFilter";
import LoadingSpinner from "../../../components/LoadingSpinner";
import EmptyState from "../../../components/User/UserJobs/EmptyState";
import { NotificationsContainer } from "../../../components/Notification";

const UserJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user_id } = useParams();
  const id = user_id;

  // Fetch categories for the filter dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`http://localhost:5000/categories/${id}`);
        const data = await response.json();

        console.log("categorrrururur", data);

        if (data.success) {
          // Add "All Categories" option and format according to your controller's response
          setCategories([
            { id: "all", name: "All Categories" },
            ...data.categories,
          ]);
        } else {
          throw new Error(data.error || "Failed to fetch categories");
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories. Please try again later.");
      }
    };

    fetchCategories();
  }, [id]);

  // Fetch jobs based on selected category
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        // Updated URL to match your backend route structure
        let url = `http://localhost:5000/jobs/user/${user_id}/${selectedCategory}`;
        console.log(url);

        // If 'all' is selected, make sure we're using the right endpoint
        if (selectedCategory === "all") {
          url = `http://localhost:5000/jobs/user/${user_id}/all`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
          setJobs(data.jobs || []);
          setError(null);
        } else {
          throw new Error(data.error || "Failed to fetch jobs");
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to load jobs. Please try again later.");
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    if (user_id) {
      fetchJobs();
    }
  }, [selectedCategory, user_id]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const addNotification = (notification) => {
    const id = Date.now();
    setNotifications((prevNotifications) => [
      ...prevNotifications,
      { ...notification, id },
    ]);
  };

  // Function to remove a notification
  const removeNotification = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <NotificationsContainer
        notifications={notifications}
        removeNotification={removeNotification}
      />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {/* Header with title and filter */}
          <div className="bg-blue-600 py-6 px-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-2xl font-bold text-white">Available Jobs</h1>
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onChange={handleCategoryChange}
              />
            </div>
          </div>

          {/* Main content area */}
          <div className="p-6">
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <div className="text-red-500 p-4 text-center">{error}</div>
            ) : jobs.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <JobCard
                    key={job.job_id}
                    job={job}
                    addNotification={addNotification}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserJobs;
