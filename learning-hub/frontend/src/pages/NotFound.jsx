import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home, BookOpen, Compass } from 'lucide-react';

/**
 * Dedicated 404 Not Found Page
 * 
 * Displayed when users navigate to a URL that does not exist or matches no defined route.
 */
export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-xl text-center space-y-8">
        {/* Visual 404 Illustration Badge */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-indigo-100 rounded-3xl rotate-6 transition-transform group-hover:rotate-12" />
          <div className="relative w-24 h-24 rounded-3xl bg-indigo-600 text-white flex flex-col items-center justify-center shadow-lg shadow-indigo-200">
            <span className="text-3xl font-black font-mono leading-none">404</span>
            <FileQuestion className="w-5 h-5 text-indigo-200 mt-1" />
          </div>
        </div>

        {/* Messaging */}
        <div className="space-y-2.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            The page or curriculum resource you are searching for does not exist, may have been moved, or has been unpublished.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
          <Link
            to="/learning-paths"
            className="p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-300 bg-slate-50/50 hover:bg-indigo-50/30 transition flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">Learning Paths</span>
              <span className="text-[11px] text-slate-500">Explore curricula</span>
            </div>
          </Link>

          <Link
            to="/notes"
            className="p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-300 bg-slate-50/50 hover:bg-indigo-50/30 transition flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">Study Notes</span>
              <span className="text-[11px] text-slate-500">Read in-depth guides</span>
            </div>
          </Link>
        </div>

        {/* Main Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-slate-100">
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
            <Home className="w-3.5 h-3.5 mr-1.5" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
