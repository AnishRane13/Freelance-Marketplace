import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ element, allowedType }) => {
  const { token, userType } = useAuth();

  if (!token || userType !== allowedType) {
    return <Navigate to="/login" />;
  }

  return element;
};

export default ProtectedRoute;
