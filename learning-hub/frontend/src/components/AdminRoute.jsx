import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';
import AdminLayout from './AdminLayout';
import Forbidden from '../pages/Forbidden';

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <span className="text-xs text-slate-500 font-medium">Verifying administrator permissions...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Forbidden />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
