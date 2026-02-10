import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children, allowedRoles = [] }) {
  const { token, user } = useSelector((state) => state.auth);

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />; // redirect to home if not allowed
  }

  return children;
}
