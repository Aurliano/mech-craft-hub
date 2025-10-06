import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  allowedRoles, 
  fallbackPath = '/'
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRoles = user?.roles?.map((role: any) => role.role?.name) || [];
  const hasAllowedRole = allowedRoles.some(role => userRoles.includes(role));

  if (!hasAllowedRole) {
    // Prevent redirect loops between protected routes by selecting a safe destination
    const isContractor = userRoles.includes('contractor');
    const isCustomer = userRoles.includes('customer');

    // If user has a known role, send them to their own dashboard
    if (isContractor) {
      if (location.pathname !== '/contractor-dashboard') {
        return <Navigate to="/contractor-dashboard" replace />;
      }
      return <Navigate to="/" replace />;
    }
    if (isCustomer) {
      if (location.pathname !== '/dashboard') {
        return <Navigate to="/dashboard" replace />;
      }
      return <Navigate to="/" replace />;
    }

    // Unknown/no role: go home (safe, public route)
    return <Navigate to={fallbackPath || '/'} replace />;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
