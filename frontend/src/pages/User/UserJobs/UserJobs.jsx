import { useState } from "react";
import { useParams } from "react-router-dom";
import UserJobsContent from "../../../components/User/UserJobs/UserJobsContent";
import UserAgreementsContent from "../../../components/User/UserJobs/UserAgreementsContent";

const UserJobs = () => {
  const [view, setView] = useState("jobs"); // Toggle between 'jobs' and 'agreements'
  const { user_id } = useParams();

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 py-8 px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {view === "jobs" ? "Available Jobs" : "User Agreements"}
            </h1>
            <button
              className="bg-white text-blue-600 font-semibold px-4 py-2 rounded-md shadow-md hover:bg-blue-100 transition-all"
              onClick={() => setView(view === "jobs" ? "agreements" : "jobs")}
            >
              {view === "jobs" ? "View Agreements" : "View Jobs"}
            </button>
          </div>
        </div>

        {view === "jobs" ? (
          <UserJobsContent user_id={user_id} />
        ) : (
          <UserAgreementsContent />
        )}
      </div>
    </div>
  );
};

export default UserJobs;