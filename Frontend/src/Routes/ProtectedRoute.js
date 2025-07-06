// src/ProtectedRoute.js
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ element, restricted = false }) => {
  const { user } = useAuth();

  // If restricted (e.g., login/otp pages) and user is authenticated, redirect to dashboard
  if (restricted && user) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated and trying to access a protected route, redirect to login
  if (!user && !restricted) {
    return <Navigate to="/login" replace />;
  }

  return element;
};

export default ProtectedRoute;