import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import First from "./pages/First/First.jsx";
import Login from "./pages/Login/Login.jsx";
import SignUp from "./pages/SignUp/SignUp.jsx";
import UserLayout from "./components/User/UserLayout.jsx";
import CompanyLayout from "./components/Company/CompanyLayout.jsx";
import UserDashboard from "./pages/User/UserDashboard/UserDashboard.jsx";
import UserProfile from "./pages/User/UserProfile/UserProfile.jsx";
import UserAgreementDetails from "./pages/User/UserAgreementDetails/UserAgreementDetailsPage.jsx";
import CompanyDashboard from "./pages/Company/CompanyDashboard/CompanyDashboard.jsx";
import CompanyProfile from "./pages/Company/CompanyProfile/CompanyProfile.jsx";
import CompanyJobs from "./pages/Company/CompanyJobs/CompanyJobs.jsx";
import CompanyJobDetails from "./pages/Company/CompanyJobDetails/CompanyJobDetails.jsx";
import UserJobs from "./pages/User/UserJobs/UserJobs.jsx";
// im[]
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./context/AuthContext";
import CompanyCreateJob from "./pages/Company/CompanyCreateJob/CompanyCreateJob.jsx";

const DashboardRedirect = () => {
  const token = localStorage.getItem("token");

  // console.log(token)
  const userType = localStorage.getItem("userType");
  // console.log(userType)
  
  if (!token) {
    return <Navigate to="/" />;
  }
  
  if (userType === "user") {
    return <Navigate to="/user/dashboard" />;
  }
  
  if (userType === "company") {
    return <Navigate to="/company/dashboard" />;
  }
  
  return <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<First />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signUp" element={<SignUp />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />
          
          {/* User Routes */}
          <Route element={<ProtectedRoute element={<UserLayout />} allowedType="user" />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/profile/:user_id" element={<UserProfile />} />
            <Route path="/user/jobs/:user_id" element={<UserJobs />} />
            <Route path="/user/agreements/:agreementId" element={<UserAgreementDetails />} />
            {/* <Route path="/user/settings" element={<UserSettings />} /> */}
          </Route>

          {/* Company Routes */}
          <Route element={<ProtectedRoute element={<CompanyLayout />} allowedType="company" />}>
            <Route path="/company/dashboard" element={<CompanyDashboard />} />
            <Route path="/company/profile/:user_id" element={<CompanyProfile />} />
            <Route path="/company/createjob" element={<CompanyCreateJob />} />
            <Route path="/company/jobs/:user_id" element={<CompanyJobs />} />
            <Route path="/company/jobDetails/:job_id" element={<CompanyJobDetails />} />
            {/* <Route path="/company/manage" element={<CompanyManage />} /> */}
            {/* <Route path="/company/settings" element={<CompanySettings />} /> */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;