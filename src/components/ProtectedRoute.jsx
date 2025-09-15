import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAuth = true, userType = null }) => {
  const { currentUser, userData, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cake-red"></div>
      </div>
    );
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific user type is required
  if (userType && userData?.userType !== userType) {
    // Redirect based on user type
    if (userData?.userType === 'shop') {
      return <Navigate to="/shop-owner-home" replace />;
    } else if (userData?.userType === 'customer') {
      return <Navigate to="/" replace />;
    }
    // If no user type, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is logged in but trying to access login/signup pages
  if (!requireAuth && currentUser) {
    // Redirect based on user type
    if (userData?.userType === 'shop') {
      return <Navigate to="/shop-owner-home" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
