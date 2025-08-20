// Protected Route Component - add this to your components
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, show protected content
  return children;
};

export default ProtectedRoute;
