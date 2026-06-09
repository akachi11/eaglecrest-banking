import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute: React.FC = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-base">
        <i className="ti ti-loader-2 animate-spin text-gold text-2xl" aria-hidden="true" />
      </div>
    );
  }

  return token ? <Outlet /> : <Navigate to="/sign-in" replace />;
};

export default ProtectedRoute;
