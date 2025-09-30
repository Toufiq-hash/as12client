import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const AdminRoute = ({ children }) => {
  const { currentUser, loading, role } = useAuth();
  const location = useLocation();

  console.log("AdminRoute - loading:", loading, "currentUser:", currentUser, "role:", role);

  if (loading) return <LoadingSpinner />;

  if (!currentUser) {
    
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role !== "admin") {
    
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminRoute;
