import { useState, useEffect } from "react";
import JobCard from "./JobCard";
import CategoryFilter from "./CategoryFilter";
import LoadingSpinner from "../../LoadingSpinner";
import EmptyState from "./EmptyState";
import { NotificationsContainer } from "../../Notification";
import { motion } from "framer-motion";

const UserJobsContent = ({ user_id }) => {
  const [jobs, setJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories for the filter dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`http://localhost:5000/categories/${user_id}`);
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
  }, [user_id]);

  // Fetch jobs based on selected category
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const url = selectedCategory === "all" 
          ? `http://localhost:5000/jobs/user/${user_id}/all`
          : `http://localhost:5000/jobs/user/${user_id}/${selectedCategory}`;

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
    <>
      <NotificationsContainer
        notifications={notifications}
        removeNotification={removeNotification}
      />

      <div className="mb-6">
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onChange={handleCategoryChange}
        />
      </div>

      {/* Main content area */}
      <div>
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
    </>
  );
};

export default UserJobsContent;