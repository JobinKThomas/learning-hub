import React, { useState, useEffect } from 'react';
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
  FileText,
  Flame,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Mail,
  Calendar,
  CheckCircle2,
  Settings,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import ProfileSettingsModal from './ProfileSettingsModal';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, isAdmin, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Close menus whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setProfileOpen(false);
        setSettingsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
    await logout();
    navigate('/login');
  };

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recently';

  const navLinks = [
    {
      to: '/learning-paths',
      label: 'Learning Paths',
      icon: BookOpen,
      color: 'text-indigo-500',
      activeBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold',
      inactiveBg: 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800',
      match: (path) => path.startsWith('/learning-paths'),
    },
    {
      to: '/notes',
      label: 'Notes',
      icon: FileText,
      color: 'text-indigo-500',
      activeBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold',
      inactiveBg: 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800',
      match: (path) => path.startsWith('/notes'),
    },
    {
      to: '/interview-questions',
      label: 'Interview Prep',
      icon: Flame,
      color: 'text-rose-500',
      activeBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold',
      inactiveBg: 'text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/30',
      match: (path) => path.startsWith('/interview-questions'),
    },
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      color: 'text-indigo-500',
      activeBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold',
      inactiveBg: 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800',
      match: (path) => path === '/dashboard',
    },
  ];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <div className="flex items-center space-x-4 lg:space-x-6">
            <Link
              to="/"
              className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition shrink-0"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100 dark:shadow-none shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">Learning Hub</span>
                <span className="text-[10px] sm:text-xs text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide uppercase">Learning Paths</span>
              </div>
            </Link>

            {/* Desktop Role-Based & Content Links */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = link.match(location.pathname);
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        isActive ? link.activeBg : link.inactiveBg
                      }`}
                    >
                      <Icon className={`w-4 h-4 mr-1.5 ${link.color}`} />
                      {link.label}
                    </Link>
                  );
                })}

                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      location.pathname.startsWith('/admin')
                        ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                        : 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200/60 dark:border-purple-800/60'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 mr-1.5" />
                    Admin Console
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Desktop Right Actions */}
          <nav className="hidden md:flex items-center space-x-3">
            <ThemeToggle />

            <a
              href="http://localhost:5000/api-docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              Swagger Docs
              <ExternalLink className="w-3.5 h-3.5 ml-1 text-slate-400" />
            </a>

            {isAuthenticated ? (
              <div className="relative flex items-center space-x-3 pl-3 border-l border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    profileOpen
                      ? 'bg-indigo-50 dark:bg-slate-800 border-indigo-300 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500'
                  }`}
                  aria-expanded={profileOpen}
                  aria-haspopup="dialog"
                  aria-label="Toggle user profile details"
                >
                  <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
                    {user?.name || 'User'}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full uppercase font-bold text-[10px] ${
                      isAdmin
                        ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                        : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                    }`}
                  >
                    {role || 'USER'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="inline-flex items-center px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  <LogIn className="w-4 h-4 mr-1.5" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-3.5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-100 dark:shadow-none transition"
                >
                  <UserPlus className="w-4 h-4 mr-1.5" />
                  Register
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Right Controls: Theme Toggle + Role Badge + Hamburger Button */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle className="min-h-[38px] min-w-[38px]" />

            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Open user profile details"
              >
                <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span className="font-semibold max-w-[80px] truncate text-xs">{user?.name?.split(' ')[0] || 'User'}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase font-bold ${
                    isAdmin
                      ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                      : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                  }`}
                >
                  {role || 'USER'}
                </span>
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg transition"
              >
                <LogIn className="w-3.5 h-3.5 mr-1" />
                Sign In
              </Link>
            )}

            {/* Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={mobileMenuOpen ? 'Close main menu' : 'Open main menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Profile Details Popover / Modal (Available on Mobile, Tablet & Desktop) */}
        {profileOpen && (
          <>
            {/* Backdrop for outside click */}
            <div
              className="fixed inset-0 z-40 bg-slate-950/60 md:bg-transparent backdrop-blur-[2px] md:backdrop-blur-none"
              onClick={() => setProfileOpen(false)}
              aria-hidden="true"
            />

            {/* Floating Popover / Modal Box */}
            <div
              className="fixed inset-x-3 sm:inset-x-6 top-18 sm:top-20 md:absolute md:inset-x-auto md:right-4 lg:md:right-8 md:top-full md:mt-2 w-auto sm:max-w-sm md:w-[410px] sm:mx-auto md:mx-0 z-50 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150"
              role="dialog"
              aria-label="User Profile Details"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center">
                  <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mr-2" />
                  Learner Profile
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Active Account
                  </span>
                  <button
                    type="button"
                    onClick={() => setProfileOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    aria-label="Close profile details"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 4 Details Grid Boxes (matching user image 1) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center text-[11px] mb-1">
                    <User className="w-3 h-3 mr-1 text-slate-400" /> Full Name
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                    {user?.name || 'User'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center text-[11px] mb-1">
                    <Mail className="w-3 h-3 mr-1 text-slate-400" /> Email Address
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-[11px] block truncate" title={user?.email}>
                    {user?.email || 'N/A'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center text-[11px] mb-1">
                    <Shield className="w-3.5 h-3.5 mr-1 text-slate-400" /> Assigned Role
                  </span>
                  <span
                    className={`inline-block font-semibold font-mono text-[10px] px-2 py-0.5 rounded ${
                      isAdmin
                        ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                        : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                    }`}
                  >
                    {role || 'USER'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center text-[11px] mb-1">
                    <Calendar className="w-3 h-3 mr-1 text-slate-400" /> Member Since
                  </span>
                  <span className="font-medium text-slate-700 dark:text-slate-300 block text-xs truncate">
                    {formattedDate}
                  </span>
                </div>
              </div>

              {/* Profile Settings Action */}
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  setSettingsModalOpen(true);
                }}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/80 transition shadow-sm cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Edit Profile & Password</span>
              </button>

              {/* Footer Navigation & Logout Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <Link
                  to="/dashboard"
                  onClick={() => setProfileOpen(false)}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setProfileOpen(false)}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition"
                  >
                    <Shield className="w-3.5 h-3.5 mr-1.5" />
                    Admin Console
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition ml-auto"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1.5" />
                  Log Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile Slide-Down Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl animate-in slide-in-from-top-2 duration-150">
          <div className="px-4 pt-3 pb-6 space-y-4">
            {/* Mobile User Profile Card */}
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setProfileOpen(true);
                }}
                className="w-full text-left bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 flex items-center justify-between hover:border-indigo-300 dark:hover:border-indigo-600 transition"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shadow-sm shrink-0">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.name || 'User'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email || 'Logged in'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 shrink-0">
                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-full uppercase font-bold tracking-wider ${
                      isAdmin
                        ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                        : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                    }`}
                  >
                    {role || 'USER'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>
            )}

            {/* Mobile Dedicated Theme Toggle Switch */}
            <ThemeToggle variant="drawer" />

            {/* Mobile Nav Links */}
            <div className="space-y-1">
              {isAuthenticated && (
                <>
                  <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    Learning & Content
                  </p>
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = link.match(location.pathname);
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition min-h-[44px] ${
                          isActive
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold border-l-4 border-indigo-600 pl-3'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-5 h-5 ${link.color}`} />
                          <span>{link.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      </Link>
                    );
                  })}

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition min-h-[44px] mt-2 ${
                        location.pathname.startsWith('/admin')
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200/80 dark:border-purple-800/80'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <span>Admin Console</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-70" />
                    </Link>
                  )}
                </>
              )}

              {!isAuthenticated && (
                <>
                  <Link
                    to="/learning-paths"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 min-h-[44px]"
                  >
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-5 h-5 text-indigo-500" />
                      <span>Learning Paths</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  </Link>
                  <Link
                    to="/notes"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 min-h-[44px]"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-indigo-500" />
                      <span>Notes</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  </Link>
                  <Link
                    to="/interview-questions"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 min-h-[44px]"
                  >
                    <div className="flex items-center space-x-3">
                      <Flame className="w-5 h-5 text-rose-500" />
                      <span>Interview Prep</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Footer Links: Swagger Docs & Auth Buttons */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <a
                href="http://localhost:5000/api-docs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition min-h-[40px]"
              >
                <span className="flex items-center">
                  Swagger Interactive API Docs
                </span>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>

              {isAuthenticated ? (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setSettingsModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 rounded-xl transition min-h-[44px]"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Account Settings (Name & Password)</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-xl transition min-h-[44px]"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out of Account</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition min-h-[44px]"
                  >
                    <LogIn className="w-4 h-4 mr-1.5" />
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition min-h-[44px]"
                  >
                    <UserPlus className="w-4 h-4 mr-1.5" />
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile & Password Settings Modal */}
      <ProfileSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
    </header>
  );
}
