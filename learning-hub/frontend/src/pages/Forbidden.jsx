import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LayoutDashboard, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

/**
 * Dedicated 403 Forbidden Page
 * 
 * Displayed when an authenticated user attempts to access administrative
 * or restricted resources without required permissions.
 */
export default function Forbidden() {
  const navigate = useNavigate();
  const { role } = useAuth();

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-red-200 shadow-xl shadow-red-50 text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200">
            <Lock className="w-3.5 h-3.5" />
            <span>HTTP 403 Forbidden</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Access Denied
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            This area is restricted to administrators. Your current account role is{' '}
            <span className="font-bold font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {role || 'USER'}
            </span>
            .
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Go Back
          </button>

          <Link
            to="/dashboard"
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-100 transition"
          >
            <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
