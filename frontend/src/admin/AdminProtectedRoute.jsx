import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  const location = useLocation();
  const adminToken = localStorage.getItem('adminToken');
  const adminRaw = localStorage.getItem('admin');

  if (!adminToken || !adminRaw) {
    return <Navigate to="/doctor/login" replace state={{ from: location.pathname }} />;
  }

  try {
    const admin = JSON.parse(adminRaw);
    if (admin?.role !== 'admin' && !admin?.isAdmin) {
      return <Navigate to="/doctor/login" replace state={{ from: location.pathname }} />;
    }
  } catch (error) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    return <Navigate to="/doctor/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default AdminProtectedRoute;
