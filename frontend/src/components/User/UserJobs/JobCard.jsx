import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import QuoteModal from "./QuoteModal";

const JobCard = ({ job, addNotification }) => {
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  // Format the price to display as currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Format date to a more readable form
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Calculate days remaining until deadline
  const getDaysRemaining = (deadlineString) => {
    const deadline = new Date(deadlineString);
    const today = new Date();
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining(job.deadline);
  const isUrgent = daysRemaining <= 7;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-blue-100 hover:border-blue-200"
    >
      {/* Card header with category and status */}
      <div className="bg-gradient-to-r from-blue-50 to-white px-5 py-3 border-b border-blue-100">
        <div className="flex justify-between items-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 shadow-sm">
            {job.category_name}
          </span>
          {isUrgent && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 shadow-sm">
              <svg 
                className="w-3 h-3 mr-1" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  fillRule="evenodd" 
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                  clipRule="evenodd"
                />
              </svg>
              Urgent
            </span>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-blue-900 mb-3 line-clamp-2">
          {job.title}
        </h3>

        <div className="text-sm text-blue-700 mb-3 flex items-center">
          <svg
            className="h-4 w-4 mr-1 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <span>{job.company_name}</span>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-5">
          <p className="text-sm text-blue-800 line-clamp-3">
            {job.description}
          </p>
        </div>

        {/* Job details */}
        <div className="grid grid-cols-1 gap-3 mb-6">
          <div className="flex items-center text-sm bg-white px-4 py-2 rounded-lg border border-blue-50">
            <svg
              className="h-5 w-5 text-blue-500 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="font-semibold text-blue-900">
              {formatPrice(job.price)}
            </span>
          </div>

          <div className="flex items-center text-sm bg-white px-4 py-2 rounded-lg border border-blue-50">
            <svg
              className="h-5 w-5 text-blue-500 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-blue-700">{job.location}</span>
          </div>

          <div className="flex items-center text-sm bg-white px-4 py-2 rounded-lg border border-blue-50">
            <svg
              className="h-5 w-5 text-blue-500 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-blue-700">
              Deadline: {formatDate(job.deadline)}
            </span>
            <span
              className={`ml-2 text-xs font-bold px-2 py-1 rounded-md ${
                isUrgent ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
              }`}
            >
              {daysRemaining} days left
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Link
            to={`/user/job/${job.job_id}`}
            className="flex-1 bg-white text-blue-600 border-2 border-blue-600 font-semibold py-3 px-4 rounded-lg text-center hover:bg-blue-50 transition-colors shadow-sm hover:shadow"
          >
            View Details
          </Link>

          <button
            onClick={() => setShowQuoteModal(true)}
            disabled={job.has_quoted}
            className={`flex-1 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors shadow-sm hover:shadow ${
              job.has_quoted
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
            }`}
          >
            {job.has_quoted ? "Quote Submitted" : "Submit Quote"}
          </button>
        </div>
      </div>

      {/* Quote Modal */}
      {showQuoteModal && (
        <QuoteModal
          jobId={job.job_id}
          jobTitle={job.title}
          onClose={() => setShowQuoteModal(false)}
          onSuccess={() => {
            // Update the local job data to show quote is submitted
            job.has_quoted = true;
            // Close the modal
            setShowQuoteModal(false);
          }}
          addNotification={addNotification}
        />
      )}
    </motion.div>
  );
};

export default JobCard;