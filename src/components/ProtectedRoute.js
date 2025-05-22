import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { token, isAuthenticated, loading } = useSelector(state => state.auth);
  const location = useLocation();
  if (loading) {
    return <div>Đang kiểm tra xác thực...</div>; // Hoặc spinner
  }
  if (!token || !isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return children;
};

export default ProtectedRoute;