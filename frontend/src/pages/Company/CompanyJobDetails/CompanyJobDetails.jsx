import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AgreementTab from "../../../components/Company/AgreementTab";
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
  Award,
  Share2,
} from "lucide-react";

const JobDetails = () => {
  const { job_id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const [quotePrice, setQuotePrice] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Update how you get the userType at the beginning of your component
  const [userType, setUserType] = useState(localStorage.getItem("userType"));
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        // Get user information from localStorage
        // const userType = localStorage.getItem("userType");
        // // console.log(userType)
        // const userId = localStorage.getItem("user_id");

        const response = await fetch(
          `http://localhost:5000/jobs/jobDetails/${job_id}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ userId, userType }),
          }
        );

        const data = await response.json();
        console.log("Job details data", data);
        setJobDetails(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching job details:", err);
        setError("Failed to load job details");
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [job_id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const userrrType = localStorage.getItem("userType");
  console.log(userrrType);

  const isJobExpired = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    return deadlineDate < now;
  };

  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      // Get user information from localStorage
      const userId = localStorage.getItem("user_id");

      // Validate inputs
      if (!quotePrice || !coverLetter) {
        throw new Error("Please fill in all fields");
      }

      // Send request to backend
      const response = await fetch(`http://localhost:5000/quotes/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId,
          jobId: job_id,
          quotePrice: parseFloat(quotePrice),
          coverLetter,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit quote");
      }

      setSubmitSuccess(true);
      setQuotePrice("");
      setCoverLetter("");

      // Refresh job details to show the new quote
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error("Error submitting quote:", err);
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleAcceptAgreement = async () => {
    try {
      const userId = localStorage.getItem("user_id");

      // Make sure agreement exists before accessing agreement_id
      if (!jobDetails?.agreement?.agreement_id) {
        throw new Error("Agreement not found");
      }

      const response = await fetch(
        `http://localhost:5000/agreements/accept/${jobDetails.agreement.agreement_id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to accept agreement");
      }

      window.location.reload();
    } catch (err) {
      console.error("Error accepting agreement:", err);
      setError(err.message);
    }
  };

  const handleDeclineAgreement = async () => {
    try {
      const userId = localStorage.getItem("user_id");

      // Make sure agreement exists before accessing agreement_id
      if (!jobDetails?.agreement?.agreement_id) {
        throw new Error("Agreement not found");
      }

      const response = await fetch(
        `http://localhost:5000/agreements/decline/${jobDetails.agreement.agreement_id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to decline agreement");
      }

      window.location.reload();
    } catch (err) {
      console.error("Error declining agreement:", err);
      setError(err.message); // Fixed: Changed 'error.message' to 'err.message'
    }
  };

  const handleShareJob = () => {
    if (navigator.share) {
      navigator
        .share({
          title: jobDetails?.job?.title, // Fixed: Use proper reference to job title
          text: `Check out this job: ${jobDetails?.job?.title}`,
          url: window.location.href,
        })
        .catch((err) => console.error("Error sharing:", err));
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => alert("Link copied to clipboard!"))
        .catch((err) => console.error("Error copying to clipboard:", err));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">
            Loading job details...
          </p>
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

  console.log("This is jobDetails", jobDetails)

  const { job, quotes, selectedFreelancer, agreement } = jobDetails;
  const expired = isJobExpired(job.deadline);
  // const userType = localStorage.getItem("userType");
  // const userId = localStorage.getItem("user_id");

  // Check if current user has already submitted a quote
  const hasSubmittedQuote = quotes?.some(
    (quote) => quote.user_id.toString() === userId
  );
  // Find the user's quote if they've submitted one
  const userQuote = quotes?.find(
    (quote) => quote.user_id.toString() === userId
  );

  console.log("userType:", userType);
  console.log("job.company_id:", job.company_id);
  console.log("userId:", userId);
  console.log("selectedFreelancer:", selectedFreelancer);
  console.log(
    "Condition result:",
    userType === "company" && !selectedFreelancer
  );

  console.log("Agreement data:", agreement);
console.log("userType:", userType);
console.log("Tab condition:", agreement && activeTab === "agreement");

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
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {job.title}
                  </h1>
                  <p className="text-gray-600">{job.company_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    expired
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {expired ? "Expired" : "Active"}
                </div>
                <button
                  onClick={handleShareJob}
                  className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                  title="Share job"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 text-blue-600" />
                <span className="ml-2 text-gray-700">{job.category_name}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="ml-2 text-gray-700">
                  Deadline: {formatDate(job.deadline)}
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="ml-2 text-gray-700">
                  Posted: {formatDate(job.created_at)}
                </span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="ml-2 text-gray-700">
                  {quotes?.length || 0} Quote{quotes?.length !== 1 ? "s" : ""}
                </span>
              </div>
              {job.location && (
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span className="ml-2 text-gray-700">{job.location}</span>
                </div>
              )}
              {job.price && (
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <span className="ml-2 text-gray-700">
                    Budget: ${job.price}
                  </span>
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
                <nav className="flex overflow-x-auto scrollbar-hidden">
                  <button
                    onClick={() => setActiveTab("description")}
                    className={`px-4 py-4 text-sm font-medium whitespace-nowrap ${
                      activeTab === "description"
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Description
                  </button>
                  {userType === "user" &&
                    !expired &&
                    !hasSubmittedQuote &&
                    !selectedFreelancer && (
                      <button
                        onClick={() => setActiveTab("quotes")}
                        className={`px-4 py-4 text-sm font-medium whitespace-nowrap ${
                          activeTab === "quotes"
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-600 hover:text-gray-800"
                        }`}
                      >
                        Submit Quote
                      </button>
                    )}
                  {userType === "user" && hasSubmittedQuote && (
                    <button
                      onClick={() => setActiveTab("myquote")}
                      className={`px-4 py-4 text-sm font-medium whitespace-nowrap ${
                        activeTab === "myquote"
                          ? "border-b-2 border-blue-600 text-blue-600"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      My Quote
                    </button>
                  )}
                  {selectedFreelancer && (
                    <button
                      onClick={() => setActiveTab("selected")}
                      className={`px-4 py-4 text-sm font-medium whitespace-nowrap ${
                        activeTab === "selected"
                          ? "border-b-2 border-blue-600 text-blue-600"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      Selected Freelancer
                    </button>
                  )}
                  {agreement && (
                    <button
                      onClick={() => setActiveTab("agreement")}
                      className={`px-4 py-4 text-sm font-medium whitespace-nowrap ${
                        activeTab === "agreement"
                          ? "border-b-2 border-blue-600 text-blue-600"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      Agreement
                    </button>
                  )}
                </nav>
              </div>
              <div className="p-6">
                {activeTab === "description" && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Job Description
                    </h2>
                    <div className="prose max-w-none text-gray-700">
                      {job.description}
                    </div>

                    {job.requirements && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Requirements
                        </h3>
                        <div className="prose max-w-none text-gray-700">
                          {job.requirements}
                        </div>
                      </div>
                    )}

                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Details
                      </h3>
                      <div className="text-gray-700">
                        <p>
                          <strong>Company:</strong> {job.company_name}
                        </p>
                        <p>
                          <strong>Category:</strong> {job.category_name}
                        </p>
                        <p>
                          <strong>Price:</strong> ${job.price}
                        </p>
                        <p>
                          <strong>Location:</strong> {job.location}
                        </p>
                        <p>
                          <strong>Deadline:</strong>{" "}
                          {new Date(job.deadline).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Status:</strong> {job.status}
                        </p>
                      </div>
                    </div>

                    {userType == "company" && quotes && quotes.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Freelancer Quotes
                        </h3>
                        <div className="space-y-4">
                          {quotes.map((quote) => (
                            <div
                              key={quote.quote_id}
                              className="border p-4 rounded-lg shadow-sm"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                                  {quote.profile_picture ? (
                                    <img
                                      src={quote.profile_picture}
                                      alt={quote.name}
                                      className="w-12 h-12 rounded-full"
                                    />
                                  ) : (
                                    <span className="text-gray-700 text-sm">
                                      {quote.name[0]}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <p className="text-gray-900 font-semibold">
                                    {quote.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Completed Jobs: {quote.completed_jobs}
                                  </p>
                                </div>
                              </div>
                              <p className="mt-3 text-gray-700">
                                <strong>Quote Price:</strong> $
                                {quote.quote_price}
                              </p>
                              <p className="mt-2 text-gray-700">
                                <strong>Cover Letter:</strong>{" "}
                                {quote.cover_letter}
                              </p>
                              {userType === "company" &&
                                // job.company_id.toString() === userId &&
                                !selectedFreelancer && (
                                  <button
                                    onClick={async () => {
                                      try {
                                        const response = await fetch(
                                          `http://localhost:5000/quotes/accept/${quote.quote_id}`,
                                          {
                                            method: "POST",
                                            headers: {
                                              "Content-Type":
                                                "application/json",
                                            },
                                            credentials: "include",
                                            body: JSON.stringify({
                                              companyId: job.company_id,
                                            }),
                                          }
                                        );

                                        if (!response.ok) {
                                          const errorData =
                                            await response.json();
                                          throw new Error(
                                            errorData.error ||
                                              "Failed to select freelancer"
                                          );
                                        }

                                        window.location.reload();
                                      } catch (err) {
                                        console.error(
                                          "Error selecting freelancer:",
                                          err
                                        );
                                        setError(err.message);
                                      }
                                    }}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                  >
                                    Select Freelancer
                                  </button>
                                )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "quotes" && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Submit a Quote
                    </h2>

                    {submitSuccess ? (
                      <div className="bg-green-100 p-4 rounded-lg">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                          <p className="text-green-700">
                            Your quote has been submitted successfully!
                          </p>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitQuote}>
                        <div className="mb-4">
                          <label
                            htmlFor="quotePrice"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Your Quote Price ($)
                          </label>
                          <input
                            type="number"
                            id="quotePrice"
                            value={quotePrice}
                            onChange={(e) => setQuotePrice(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your price"
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label
                            htmlFor="coverLetter"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Cover Letter
                          </label>
                          <textarea
                            id="coverLetter"
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Write a brief message explaining why you're the best fit for this job..."
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          disabled={submitLoading}
                        >
                          {submitLoading ? (
                            <div className="flex items-center">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Submitting...
                            </div>
                          ) : (
                            "Submit Quote"
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {activeTab === "myquote" && userQuote && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Your Quote
                    </h2>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <FileText className="h-5 w-5 text-blue-600 mr-2" />
                        <h3 className="text-lg font-medium text-gray-900">
                          Quote Details
                        </h3>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Price</p>
                          <p className="text-lg font-medium text-gray-900">
                            ${userQuote.quote_price}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">Cover Letter</p>
                          <p className="text-gray-700">
                            {userQuote.cover_letter}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">Submitted On</p>
                          <p className="text-gray-700">
                            {formatDate(userQuote.created_at)}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <div
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              selectedFreelancer &&
                              selectedFreelancer.user_id.toString() === userId
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {selectedFreelancer &&
                            selectedFreelancer.user_id.toString() === userId
                              ? "Selected"
                              : "Pending"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "selected" && selectedFreelancer && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Selected Freelancer
                    </h2>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                          {selectedFreelancer.profile_picture ? (
                            <img
                              src={selectedFreelancer.profile_picture}
                              alt={selectedFreelancer.name}
                              className="w-16 h-16 rounded-full"
                            />
                          ) : (
                            <User className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {selectedFreelancer.name}
                          </h3>
                          <p className="text-gray-600">
                            Completed Jobs: {selectedFreelancer.completed_jobs}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Quote Price</p>
                          <p className="text-lg font-medium text-gray-900">
                            ${selectedFreelancer.quote_price}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">Cover Letter</p>
                          <p className="text-gray-700">
                            {selectedFreelancer.cover_letter}
                          </p>
                        </div>

                        {userType == "company" &&
                          // job.company_id.toString() === userId &&
                          !agreement && (
                            <button
                              onClick={async () => {
                                try {
                                  const response = await fetch(
                                    `http://localhost:5000/agreements/create`,
                                    {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      credentials: "include",
                                      body: JSON.stringify({
                                        jobId: job_id,
                                        freelancerId:
                                          selectedFreelancer.user_id,
                                        quoteId: selectedFreelancer.quote_id,
                                        price: selectedFreelancer.quote_price,
                                      }),
                                    }
                                  );

                                  if (!response.ok) {
                                    throw new Error(
                                      "Failed to create agreement"
                                    );
                                  }

                                  window.location.reload();
                                } catch (err) {
                                  console.error(
                                    "Error creating agreement:",
                                    err
                                  );
                                  setError(err.message);
                                }
                              }}
                              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Create Agreement
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "agreement" &&
                  agreement &&
                  (console.log("Rendering AgreementTab with:", {
                    activeTab,
                    agreement,
                    job,
                    selectedFreelancer,
                    userId,
                    userType,
                  }),
                  (
                    <AgreementTab
                      agreement={agreement}
                      job={job}
                      selectedFreelancer={selectedFreelancer}
                      userId={userId}
                      userType={userType}
                      formatDate={formatDate}
                      handleAcceptAgreement={handleAcceptAgreement}
                      handleDeclineAgreement={handleDeclineAgreement}
                    />
                  ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden sticky top-8">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Job Summary
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`font-medium ${
                        expired ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {expired ? "Expired" : "Active"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Budget:</span>
                    <span className="font-medium text-gray-900">
                      ${job.price}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Deadline:</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(job.deadline)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium text-gray-900">
                      {job.category_name}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium text-gray-900">
                      {job.location}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Posted:</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(job.created_at)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Quotes:</span>
                    <span className="font-medium text-gray-900">
                      {quotes?.length || 0}
                    </span>
                  </div>
                </div>

                {userType === "user" &&
                  !expired &&
                  !hasSubmittedQuote &&
                  !selectedFreelancer && (
                    <button
                      onClick={() => setActiveTab("quotes")}
                      className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Submit a Quote
                    </button>
                  )}

                {userType === "user" && hasSubmittedQuote && (
                  <button
                    onClick={() => setActiveTab("myquote")}
                    className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View My Quote
                  </button>
                )}

                {userType === "company" &&
                  job.company_id.toString() === userId &&
                  selectedFreelancer &&
                  !agreement && (
                    <button
                      onClick={() => setActiveTab("selected")}
                      className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Agreement
                    </button>
                  )}

                {agreement && (
                  <button
                    onClick={() => setActiveTab("agreement")}
                    className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Agreement
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    // </div>
  );
};

export default JobDetails;
