import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';
import AdminLayout from './AdminLayout';

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
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-red-200 shadow-xl shadow-red-50 text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Access Denied (403)</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              This area is restricted to administrators. Your current account role is{' '}
              <span className="font-bold font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                {role || 'USER'}
              </span>
              .
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-100 transition"
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Return to Learning Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}
