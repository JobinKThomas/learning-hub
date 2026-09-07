import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  BookOpen,
  LogIn,
  UserPlus,
  LogOut,
  ExternalLink,
  User,
  LayoutDashboard,
  Shield,
  Layers,
} from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, isAdmin, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo & Navigation */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 transition">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-slate-900 leading-tight">Learning Hub</span>
                <span className="text-xs text-indigo-600 font-semibold tracking-wide uppercase">Learning Paths</span>
              </div>
            </Link>

            {/* Role-Based & Content Links */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  to="/learning-paths"
                  className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    location.pathname.startsWith('/learning-paths')
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <BookOpen className="w-4 h-4 mr-1.5 text-indigo-500" />
                  Learning Paths
                </Link>

                <Link
                  to="/dashboard"
                  className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    location.pathname === '/dashboard'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 mr-1.5 text-indigo-500" />
                  Dashboard
                </Link>

                {isAdmin && (
                  <>
                    <Link
                      to="/admin"
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        location.pathname === '/admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'text-purple-700 hover:bg-purple-50'
                      }`}
                    >
                      <Shield className="w-4 h-4 mr-1.5 text-purple-600" />
                      Admin
                    </Link>

                    <Link
                      to="/admin/learning-paths"
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        location.pathname.startsWith('/admin/learning-paths')
                          ? 'bg-purple-100 text-purple-800'
                          : 'text-purple-700 hover:bg-purple-50'
                      }`}
                    >
                      <Layers className="w-4 h-4 mr-1.5 text-purple-600" />
                      Paths
                    </Link>

                    <Link
                      to="/admin/modules"
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        location.pathname.startsWith('/admin/modules')
                          ? 'bg-purple-100 text-purple-800'
                          : 'text-purple-700 hover:bg-purple-50'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 mr-1.5 text-purple-600" />
                      Modules
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex items-center space-x-3">
            <a
              href="http://localhost:5000/api-docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
            >
              Swagger Docs
              <ExternalLink className="w-3.5 h-3.5 ml-1 text-slate-400" />
            </a>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 transition"
                >
                  <User className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-medium text-slate-700">{user?.name || 'User'}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full uppercase font-bold text-[10px] ${
                      isAdmin
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    {role || 'USER'}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="inline-flex items-center px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                >
                  <LogIn className="w-4 h-4 mr-1.5" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-3.5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-100 transition"
                >
                  <UserPlus className="w-4 h-4 mr-1.5" />
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
