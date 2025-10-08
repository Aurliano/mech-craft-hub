import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [],
  fallbackPath = '/'
}) => {
  const { isAuthenticated, user, isLoading, isContractor, isCustomer } = useAuth();
  const location = useLocation();

  // Show loading while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no roles are specified, allow access
  if (allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Check if user has any of the allowed roles
  const hasAllowedRole = allowedRoles.some(role => {
    if (role === 'customer') return isCustomer;
    if (role === 'contractor') return isContractor;
    return false;
  });

  if (!hasAllowedRole) {
    // Redirect to appropriate dashboard based on user's role
    if (isContractor) {
      return <Navigate to="/contractor-dashboard" replace />;
    }
    if (isCustomer) {
      return <Navigate to="/dashboard" replace />;
    }
    
    // If user has no recognized role, redirect to fallback
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
