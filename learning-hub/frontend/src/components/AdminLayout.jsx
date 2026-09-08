import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Shield,
  LayoutDashboard,
  Layers,
  BookOpen,
  Code2,
  FileText,
  Link2,
  Terminal,
  HelpCircle,
  Flame,
  Plus,
  ChevronDown,
  ArrowUpRight,
  Menu,
  X,
} from 'lucide-react';

const ADMIN_NAV_ITEMS = [
  {
    name: 'Dashboard',
    path: '/admin',
    exact: true,
    icon: LayoutDashboard,
    createPath: null,
  },
  {
    name: 'Learning Paths',
    path: '/admin/learning-paths',
    icon: Layers,
    createPath: '/admin/learning-paths/create',
  },
  {
    name: 'Modules',
    path: '/admin/modules',
    icon: BookOpen,
    createPath: '/admin/modules/create',
  },
  {
    name: 'Sections',
    path: '/admin/sections',
    icon: Layers,
    createPath: '/admin/sections/create',
  },
  {
    name: 'Topics',
    path: '/admin/topics',
    icon: Code2,
    createPath: '/admin/topics/create',
  },
  {
    name: 'Notes',
    path: '/admin/notes',
    icon: FileText,
    createPath: '/admin/notes/create',
  },
  {
    name: 'Resources',
    path: '/admin/resources',
    icon: Link2,
    createPath: '/admin/resources/create',
  },
  {
    name: 'Playgrounds',
    path: '/admin/playgrounds',
    icon: Terminal,
    createPath: '/admin/playgrounds/create',
  },
  {
    name: 'Quizzes',
    path: '/admin/quizzes',
    icon: HelpCircle,
    createPath: '/admin/quizzes/create',
  },
  {
    name: 'Interview Qs',
    path: '/admin/interview-questions',
    icon: Flame,
    createPath: '/admin/interview-questions/create',
  },
];

export default function AdminLayout({ children }) {
  const location = useLocation();
  const { user } = useAuth();
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  const currentSection = ADMIN_NAV_ITEMS.find((item) => isActive(item)) || {
    name: 'Admin Console',
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Top Admin Sub-Header */}
      <div className="bg-slate-900 text-white border-b border-slate-800 sticky top-16 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Admin Title & Current Section */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-400/40 text-purple-300 flex items-center justify-center font-bold">
                <Shield className="w-4 h-4" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="font-bold text-sm tracking-wide text-white">
                  Admin Console
                </span>
                <span className="text-slate-400 text-xs hidden sm:inline">/</span>
                <span className="text-purple-300 text-xs font-semibold hidden sm:inline">
                  {currentSection.name}
                </span>
              </div>
            </div>

            {/* Quick Actions & Navigation Toggle */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Quick Create Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setQuickCreateOpen(!quickCreateOpen)}
                  className="inline-flex items-center px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Quick Create</span>
                  <ChevronDown className="w-3 h-3 opacity-75" />
                </button>

                {quickCreateOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setQuickCreateOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        Create New Content
                      </div>
                      <div className="py-1 max-h-80 overflow-y-auto">
                        {ADMIN_NAV_ITEMS.filter((i) => i.createPath).map((item) => {
                          const IconComponent = item.icon;
                          return (
                            <Link
                              key={item.createPath}
                              to={item.createPath}
                              onClick={() => setQuickCreateOpen(false)}
                              className="flex items-center px-3 py-2 text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition"
                            >
                              <IconComponent className="w-3.5 h-3.5 mr-2 text-purple-600" />
                              <span>New {item.name.replace(/s$/, '')}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Exit to Learner Hub */}
              <Link
                to="/dashboard"
                className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/80 transition gap-1"
                title="Return to Learner Experience"
              >
                <span className="hidden md:inline">Learner Hub</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              {/* Mobile menu trigger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white min-h-[40px] min-w-[40px] flex items-center justify-center transition focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label="Toggle admin navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Navigation Pills (Desktop & Tablet) */}
        <div className="border-t border-slate-800/80 bg-slate-950/70 backdrop-blur-sm overflow-x-auto scrollbar-thin">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-1 py-2 whitespace-nowrap min-w-max">
              {ADMIN_NAV_ITEMS.map((item) => {
                const active = isActive(item);
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition min-h-[36px] ${
                      active
                        ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 mr-1.5 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Accordion Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 space-y-1 shadow-2xl animate-in slide-in-from-top-1 duration-150">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 pb-1">
              Admin Sections
            </div>
            {ADMIN_NAV_ITEMS.map((item) => {
              const active = isActive(item);
              const IconComponent = item.icon;
              return (
                <div
                  key={item.path}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition min-h-[44px] ${
                    active ? 'bg-purple-900/60 text-white border-l-4 border-purple-500 pl-2.5' : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <Link
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2.5 flex-1 min-h-[40px]"
                  >
                    <IconComponent className={`w-4 h-4 ${active ? 'text-purple-300' : 'text-purple-400'}`} />
                    <span className={active ? 'font-bold text-white' : 'text-slate-300'}>{item.name}</span>
                  </Link>
                  {item.createPath && (
                    <Link
                      to={item.createPath}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-2.5 py-1 rounded-lg bg-purple-700/60 hover:bg-purple-700 text-[10px] font-bold text-purple-200 transition min-h-[32px] flex items-center"
                    >
                      + Add
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Admin Page Content */}
      <main className="pb-16">{children}</main>
    </div>
  );
}
