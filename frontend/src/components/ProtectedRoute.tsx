import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

type ProtectedRouteProps = {
    allowedRoles?: string[];
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('role');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
        // Redirect to default dashboard based on actual role
        if (role === 'FACILITATOR') return <Navigate to="/my-events" replace />;
        return <Navigate to="/events" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
