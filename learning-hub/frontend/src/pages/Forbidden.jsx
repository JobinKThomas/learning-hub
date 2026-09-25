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
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-red-200 dark:border-red-900/50 shadow-xl shadow-red-50 dark:shadow-none text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs font-bold border border-red-200 dark:border-red-800">
            <Lock className="w-3.5 h-3.5" />
            <span>HTTP 403 Forbidden</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Access Denied
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            This area is restricted to administrators. Your current account role is{' '}
            <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-transparent dark:border-indigo-900/50 px-2 py-0.5 rounded">
              {role || 'USER'}
            </span>
            .
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5 text-slate-500 dark:text-slate-400" />
            Go Back
          </button>

          <Link
            to="/dashboard"
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-100 dark:shadow-none transition"
          >
            <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
