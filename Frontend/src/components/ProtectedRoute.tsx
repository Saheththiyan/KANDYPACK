import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAuthToken } from '@/lib/mockAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const auth = getAuthToken();

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !Array.isArray(requiredRole) ? auth.role !== requiredRole : !requiredRole.includes(auth.role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};