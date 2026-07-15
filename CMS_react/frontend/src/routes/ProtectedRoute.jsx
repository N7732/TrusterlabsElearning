import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles) {
    let hasAccess = allowedRoles.includes(user?.user_type);
    
    // Superusers implicitly have 'admin' access
    if (user?.is_superuser && allowedRoles.includes('admin')) {
      hasAccess = true;
    }

    if (!hasAccess) {
      // If not authorized for this role, redirect to appropriate dashboard
      if (user?.is_superuser || user?.user_type === 'admin') {
        return <Navigate to="/superadmin" replace />;
      }
      if (user?.user_type === 'instructor') {
        return <Navigate to="/instructor" replace />;
      }
      return <Navigate to="/learner/dashboard" replace />;
    }
  }

  return <Outlet />;
};
