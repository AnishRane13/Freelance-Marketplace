import { Award, CheckCircle } from "lucide-react";
import { useState } from "react";
import PaymentModal from "./PaymentModal";
import JobCompletionButton from "./JobCompletionButton";

const AgreementTab = ({
  agreement,
  job,
  selectedFreelancer,
  userId,
  userType,
  formatDate,
  handleAcceptAgreement,
  handleDeclineAgreement,
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const company_id = localStorage.getItem("user_id");

  const handleMarkAsCompleted = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/jobs/${job.job_id}/completion-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            company_id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initiate payment");
      }

      setPaymentData(data);
      setShowPaymentModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Job Agreement
      </h2>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 text-red-700">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center mb-6">
          <Award className="h-6 w-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">
            Agreement Details
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Agreement ID</p>
            <p className="text-gray-700">{agreement.agreement_id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Job</p>
            <p className="text-gray-700">{job.title}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Freelancer</p>
            <p className="text-gray-700">{selectedFreelancer.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Companyyyyyyyyyyy</p>
            <p className="text-gray-700">{job.company_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Price</p>
            <p className="text-lg font-medium text-gray-900">
              ${agreement.price}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date Created</p>
            <p className="text-gray-700">{formatDate(agreement.created_at)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <div
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                agreement.status === "accepted"
                  ? "bg-green-100 text-green-800"
                  : agreement.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {agreement.status === "accepted"
                ? "Accepted"
                : agreement.status === "pending"
                ? "Pending"
                : "Declined"}
            </div>
          </div>

          {userType === "freelancer" &&
            agreement.status === "pending" &&
            selectedFreelancer.user_id.toString() === userId && (
              <div className="flex space-x-4 mt-4">
                <button
                  onClick={handleAcceptAgreement}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Accept Agreement
                </button>
                <button
                  onClick={handleDeclineAgreement}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Decline Agreement
                </button>
              </div>
            )}

          {/* Mark as Completed button - only visible to company users and for accepted agreements */}
          {userType === "company" &&
  agreement.status === "accepted" &&
  job.status === "in_progress" && (
    <div className="mt-6 pt-4 border-t border-blue-200">
      <JobCompletionButton jobId={job.job_id} userId={userId} />
      <p className="text-sm text-gray-500 mt-2 text-center">
        This will initiate payment to the freelancer and mark the job
        as completed.
      </p>
    </div>
)}
        </div>
      </div>

      {showPaymentModal && paymentData && (
        <PaymentModal
          paymentData={paymentData}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
};

export default AgreementTab;



// import { Award, CheckCircle } from "lucide-react";
// import { useState } from "react";
// import PaymentModal from "./PaymentModal";
// import JobCompletionButton from "./JobCompletionModal";

// const AgreementTab = ({
//   // eslint-disable-next-line react/prop-types
//   agreement,
//   job,
//   selectedFreelancer,
//   userId,
//   userType,
//   formatDate,
//   handleAcceptAgreement,
//   handleDeclineAgreement,
// }) => {
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [paymentData, setPaymentData] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const company_id = localStorage.getItem("user_id");

//   const handleMarkAsCompleted = async () => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       // Changed from /api to http://localhost:5000 to match your other API calls
//       const response = await fetch(
//         `http://localhost:5000/jobs/${job.job_id}/completion-payment`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           credentials: "include", // Added to ensure cookies are sent
//           body: JSON.stringify({
//             company_id,
//           }),
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || "Failed to initiate payment");
//       }

//       setPaymentData(data);
//       setShowPaymentModal(true);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div>
//       <h2 className="text-xl font-semibold text-gray-900 mb-4">
//         Job Agreement
//       </h2>

//       {error && (
//         <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 text-red-700">
//           <p>{error}</p>
//         </div>
//       )}

//       <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
//         <div className="flex items-center mb-6">
//           <Award className="h-6 w-6 text-blue-600 mr-2" />
//           <h3 className="text-lg font-medium text-gray-900">
//             Agreement Details
//           </h3>
//         </div>

//         <div className="space-y-4">
//           <div>
//             <p className="text-sm text-gray-500">Agreement ID</p>
//             <p className="text-gray-700">{agreement.agreement_id}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-500">Job</p>
//             <p className="text-gray-700">{job.title}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-500">Freelancer</p>
//             <p className="text-gray-700">{selectedFreelancer.name}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-500">Company</p>
//             <p className="text-gray-700">{job.company_name}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-500">Price</p>
//             <p className="text-lg font-medium text-gray-900">
//               ${agreement.price}
//             </p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-500">Date Created</p>
//             <p className="text-gray-700">{formatDate(agreement.created_at)}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-500">Status</p>
//             <div
//               className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                 agreement.status === "accepted"
//                   ? "bg-green-100 text-green-800"
//                   : agreement.status === "pending"
//                   ? "bg-yellow-100 text-yellow-800"
//                   : "bg-red-100 text-red-800"
//               }`}
//             >
//               {agreement.status === "accepted"
//                 ? "Accepted"
//                 : agreement.status === "pending"
//                 ? "Pending"
//                 : "Declined"}
//             </div>
//           </div>

//           {/* Changed freelancer to user to match the userType check in JobDetails */}
//           {userType === "user" &&
//             agreement.status === "pending" &&
//             selectedFreelancer.user_id.toString() === userId && (
//               <div className="flex space-x-4 mt-4">
//                 <button
//                   onClick={handleAcceptAgreement}
//                   className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//                 >
//                   Accept Agreement
//                 </button>
//                 <button
//                   onClick={handleDeclineAgreement}
//                   className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//                 >
//                   Decline Agreement
//                 </button>
//               </div>
//             )}

//           {/* Mark as Completed button - only visible to company users and for accepted agreements */}
//           {userType === "company" &&
//             agreement.status === "accepted" &&
//             job.status === "in_progress" && (
//               <div className="mt-6 pt-4 border-t border-blue-200">
//                 {/* // eslint-disable-next-line react/prop-types */}
//                 <JobCompletionButton jobId={job.job_id} userId={userId} />
//                 <p className="text-sm text-gray-500 mt-2 text-center">
//                   This will initiate payment to the freelancer and mark the job
//                   as completed.
//                 </p>
//               </div>
//             )}
//         </div>
//       </div>

//       {showPaymentModal && paymentData && (
//         <PaymentModal
//           paymentData={paymentData}
//           onClose={() => setShowPaymentModal(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default AgreementTab;
