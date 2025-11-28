import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles = [] }) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const { token, role } = userInfo;

    // Check if user is authenticated
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has required role
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        // Redirect based on current role
        if (role === 'patient') {
            return <Navigate to="/dashboard" replace />;
        } else if (role === 'doctor') {
            return <Navigate to="/curesight/search" replace />;
        } else {
            return <Navigate to="/" replace />;
        }
    }

    // User is authenticated and authorized
    return <Outlet />;
};

export default ProtectedRoute;
