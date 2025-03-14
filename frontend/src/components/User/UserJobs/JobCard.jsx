import { useState } from "react";
import { Link } from "react-router-dom";
import QuoteModal from "./QuoteModal";

const JobCard = ({ job, addNotification }) => {
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  // console.log(job)

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
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Card header with category */}
      <div className="bg-blue-50 px-4 py-2 border-b border-blue-100">
        <div className="flex justify-between items-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {job.category_name}
          </span>
          {isUrgent && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Urgent
            </span>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {job.title}
        </h3>

        <div className="text-sm text-gray-500 mb-3 flex items-center">
          <svg
            className="h-4 w-4 mr-1"
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

        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {job.description}
        </p>

        {/* Job details */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center text-sm">
            <svg
              className="h-4 w-4 text-blue-500 mr-2"
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
            <span className="font-medium text-gray-900">
              {formatPrice(job.price)}
            </span>
          </div>

          <div className="flex items-center text-sm">
            <svg
              className="h-4 w-4 text-blue-500 mr-2"
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
            <span className="text-gray-600">{job.location}</span>
          </div>

          <div className="flex items-center text-sm">
            <svg
              className="h-4 w-4 text-blue-500 mr-2"
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
            <span className="text-gray-600">
              Deadline: {formatDate(job.deadline)}
            </span>
            <span
              className={`ml-2 text-xs font-medium ${
                isUrgent ? "text-red-600" : "text-green-600"
              }`}
            >
              ({daysRemaining} days left)
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-3">
          <Link
            to={`/user/job/${job.job_id}`}
            className="flex-1 bg-white text-blue-600 border border-blue-600 font-medium py-2 px-4 rounded-md text-sm text-center hover:bg-blue-50 transition-colors"
          >
            View Details
          </Link>

          <button
            onClick={() => setShowQuoteModal(true)}
            disabled={job.has_quoted}
            className={`flex-1 text-white font-medium py-2 px-4 rounded-md text-sm text-center transition-colors ${
              job.has_quoted
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
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
    </div>
  );
};

export default JobCard;
