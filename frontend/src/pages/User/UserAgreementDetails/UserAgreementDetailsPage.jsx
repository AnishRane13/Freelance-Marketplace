import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LoadingSpinner from "../../../components/LoadingSpinner";

const UserAgreementDetails = () => {
  const { agreementId } = useParams();
  const navigate = useNavigate();
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchAgreementDetails = async () => {
      setLoading(true);
      console.log("Fetching agreement details...");
      try {
        // Get current user from localStorage or context
        const user_id = JSON.parse(localStorage.getItem("user_id"));
        console.log("Current user_id from localStorage:", user_id);
  
        // Constructing fetch URL
        const url = `http://localhost:5000/agreements/${agreementId}`;
        console.log("Fetch URL:", url);
  
        // Creating fetch options
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ userId: user_id }),
        };
        console.log("Fetch options:", options);
  
        // Make POST request to get agreement details
        const response = await fetch(url, options);
        console.log("Raw response:", response);
  
        const data = await response.json();
        console.log("Response data:", data);
  
        if (response.ok) {
          setAgreement(data);
          setError(null);
          console.log("Agreement set successfully:", data);
        } else {
          throw new Error(data.error || "Failed to fetch agreement details");
        }
      } catch (err) {
        console.error("Error fetching agreement details:", err);
        setError("Failed to load agreement details. Please try again later.");
      } finally {
        setLoading(false);
        console.log("Loading finished.");
      }
    };
  
    if (agreementId) {
      console.log("agreementId is present:", agreementId);
      fetchAgreementDetails();
    } else {
      console.log("No agreementId found.");
    }
  }, [agreementId]);
  

  const handleGoBack = () => {
    navigate(-1);
  };

  // Function to handle agreement acceptance
  const handleAcceptAgreement = async () => {
    setProcessing(true);
    try {
      const user_id = JSON.parse(localStorage.getItem("user_id"));

      const response = await fetch(
        `http://localhost:5000/agreements/${agreementId}/accept`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ userId: user_id }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Update the agreement status in the state
        setAgreement({
          ...agreement,
          status: "active",
          response_at: new Date().toISOString(),
        });

        // Show success message
        alert("Agreement accepted successfully!");
      } else {
        throw new Error(data.error || "Failed to accept agreement");
      }
    } catch (err) {
      console.error("Error accepting agreement:", err);
      setError("Failed to accept agreement. Please try again later.");
    } finally {
      setProcessing(false);
    }
  };

  // Function to handle agreement rejection
  const handleRejectAgreement = async () => {
    if (
      !confirm(
        "Are you sure you want to reject this agreement? This action cannot be undone."
      )
    ) {
      return;
    }

    setProcessing(true);
    try {
      const user_id = JSON.parse(localStorage.getItem("user_id"));

      const response = await fetch(
        `http://localhost:5000/agreements/${agreementId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ userId: user_id }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Update the agreement status in the state
        setAgreement({
          ...agreement,
          status: "rejected",
          response_at: new Date().toISOString(),
        });

        // Show success message
        alert("Agreement rejected successfully!");
        // Optionally navigate back after rejection
        setTimeout(() => navigate("/user/jobs/:user_id"), 1500);
      } else {
        throw new Error(data.error || "Failed to reject agreement");
      }
    } catch (err) {
      console.error("Error rejecting agreement:", err);
      setError("Failed to reject agreement. Please try again later.");
    } finally {
      setProcessing(false);
    }
  };

  // Format date to a readable string
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate time remaining until deadline
  const getTimeRemaining = (deadline) => {
    if (!deadline) return { days: 0, hours: 0, minutes: 0 };

    const now = new Date();
    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate - now;

    if (timeDiff <= 0)
      return { days: 0, hours: 0, minutes: 0, isOverdue: true };

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes, isOverdue: false };
  };

  // Get status badge styles
  const getStatusBadgeStyles = (status) => {
    if (!status) return "bg-gray-100 text-gray-700";

    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "canceled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={handleGoBack}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
          Back to Agreements
        </button>
        <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center font-medium shadow-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={handleGoBack}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
          Back to Agreements
        </button>
        <div className="bg-white bg-opacity-70 rounded-xl shadow-md p-6 text-center py-16">
          <h3 className="text-xl font-medium text-gray-800 mb-2">
            Agreement Not Found
          </h3>
          <p className="text-gray-600">
            The requested agreement could not be found.
          </p>
        </div>
      </div>
    );
  }

  const timeRemaining = getTimeRemaining(agreement.deadline);

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={handleGoBack}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          ></path>
        </svg>
        Back to Agreements
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Agreement Header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white px-6 py-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {agreement.job_title}
                </h1>
                <div className="flex items-center text-gray-600 text-sm">
                  <span>
                    Agreement created on {formatDate(agreement.created_at)}
                  </span>
                  <span className="mx-2">•</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeStyles(
                      agreement.status
                    )}`}
                  >
                    {agreement.status.charAt(0).toUpperCase() +
                      agreement.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                    <span className="text-gray-600 font-bold">
                      {agreement.company_name?.charAt(0).toUpperCase() || "C"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {agreement.company_name}
                    </h3>
                    <p className="text-gray-500 text-sm">Company</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Deadline and Payment Info */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Deadline
                </h3>
                <p className="text-lg font-semibold text-gray-800 mb-2">
                  {formatDate(agreement.deadline)}
                </p>

                {timeRemaining.isOverdue ? (
                  <p className="text-red-500 text-sm font-medium">Overdue</p>
                ) : (
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-green-500 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <p className="text-green-500 text-sm font-medium">
                      {timeRemaining.days} days, {timeRemaining.hours} hours
                      remaining
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Payment
                </h3>
                <p className="text-lg font-semibold text-blue-600">
                  ${agreement.price}
                </p>
                <p className="text-gray-500 text-sm">
                  For the completion of this project
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            <button
              className={`py-3 px-6 ${
                activeTab === "details"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              } font-medium`}
              onClick={() => setActiveTab("details")}
            >
              Details
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-md p-6">
          {activeTab === "details" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Job Description
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">
                  {agreement.job_description}
                </p>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Agreement Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Freelancer
                    </h4>
                    <p className="text-gray-800">{agreement.user_name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Company
                    </h4>
                    <p className="text-gray-800">{agreement.company_name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Start Date
                    </h4>
                    <p className="text-gray-800">
                      {formatDate(agreement.created_at)}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Response Date
                    </h4>
                    <p className="text-gray-800">
                      {formatDate(agreement.response_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

       {/* Action Buttons */}
<div className="mt-6 flex justify-end space-x-4">
  {agreement.status.toLowerCase() === "pending" && (
    <>
      <button
        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md transition-colors shadow-sm"
        onClick={handleAcceptAgreement}
        disabled={processing}
      >
        {processing ? "Processing..." : "Accept Agreement"}
      </button>
      <button
        className="border border-red-500 text-red-500 hover:bg-red-50 font-medium py-2 px-6 rounded-md transition-colors shadow-sm"
        onClick={handleRejectAgreement}
        disabled={processing}
      >
        {processing ? "Processing..." : "Reject Agreement"}
      </button>
    </>
  )}
</div>
      </motion.div>
    </div>
  );
};

export default UserAgreementDetails;
