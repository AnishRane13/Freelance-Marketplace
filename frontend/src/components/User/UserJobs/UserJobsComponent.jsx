import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import JobCard from "./JobCard";
import CategoryFilter from "./CategoryFilter";
import LoadingSpinner from "../../LoadingSpinner";
import EmptyState from "./EmptyState";
import { NotificationsContainer } from "../../Notification";
import { motion } from "framer-motion";

const UserJobsComponent = () => {
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

        if (data.success) {
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
        let url = `http://localhost:5000/jobs/user/${user_id}/${selectedCategory}`;

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

  const removeNotification = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  };

  // Animation variants for staggered cards
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

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white min-h-screen">
      <NotificationsContainer
        notifications={notifications}
        removeNotification={removeNotification}
      />

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header with glass effect */}
        <div className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 py-8 px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Available Jobs
              </h1>
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onChange={handleCategoryChange}
              />
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="p-1">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center font-medium shadow-sm">
              {error}
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white bg-opacity-70 rounded-xl shadow-md p-6">
              <EmptyState />
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {jobs.map((job) => (
                <motion.div key={job.job_id} variants={itemVariants}>
                  <JobCard
                    job={job}
                    addNotification={addNotification}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserJobsComponent;