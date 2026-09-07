import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import {
  Shield,
  Users,
  UserCheck,
  GraduationCap,
  Activity,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Code2,
  Layers,
  FileText,
  BookOpen,
  Link2,
  Terminal,
  HelpCircle,
  Flame,
  Plus,
  ArrowRight,
  Search,
  Server,
  Database,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

const CONTENT_DOMAINS = [
  {
    id: 'learningPaths',
    title: 'Learning Paths',
    description: 'Top-level curriculum roadmaps & career tracks',
    countKey: 'learningPaths',
    unit: 'Paths',
    listPath: '/admin/learning-paths',
    createPath: '/admin/learning-paths/create',
    icon: Layers,
    color: 'from-purple-600 to-indigo-600',
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  {
    id: 'modules',
    title: 'Modules',
    description: 'Major curriculum milestones within learning paths',
    countKey: 'modules',
    unit: 'Modules',
    listPath: '/admin/modules',
    createPath: '/admin/modules/create',
    icon: BookOpen,
    color: 'from-blue-600 to-indigo-600',
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  {
    id: 'sections',
    title: 'Sections',
    description: 'Thematic chapters and unit divisions in modules',
    countKey: 'sections',
    unit: 'Sections',
    listPath: '/admin/sections',
    createPath: '/admin/sections/create',
    icon: Layers,
    color: 'from-cyan-600 to-blue-600',
    badgeColor: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  },
  {
    id: 'topics',
    title: 'Topics',
    description: 'Core instructional subjects and key concept items',
    countKey: 'topics',
    unit: 'Topics',
    listPath: '/admin/topics',
    createPath: '/admin/topics/create',
    icon: Code2,
    color: 'from-teal-600 to-emerald-600',
    badgeColor: 'bg-teal-100 text-teal-700 border-teal-200',
  },
  {
    id: 'notes',
    title: 'Notes & Explanations',
    description: 'In-depth markdown lessons and conceptual breakdowns',
    countKey: 'notes',
    unit: 'Notes',
    listPath: '/admin/notes',
    createPath: '/admin/notes/create',
    icon: FileText,
    color: 'from-emerald-600 to-green-600',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  {
    id: 'resources',
    title: 'Curated Resources',
    description: 'Docs, video tutorials, articles, and GitHub repos',
    countKey: 'resources',
    unit: 'Resources',
    listPath: '/admin/resources',
    createPath: '/admin/resources/create',
    icon: Link2,
    color: 'from-amber-600 to-orange-600',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  {
    id: 'playgrounds',
    title: 'Code Playgrounds',
    description: 'Interactive execution sandboxes & starting templates',
    countKey: 'playgrounds',
    unit: 'Sandboxes',
    listPath: '/admin/playgrounds',
    createPath: '/admin/playgrounds/create',
    icon: Terminal,
    color: 'from-orange-600 to-rose-600',
    badgeColor: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  {
    id: 'quizzes',
    title: 'Knowledge Quizzes',
    description: 'Multiple-choice evaluations and passing criteria',
    countKey: 'quizzes',
    unit: 'Quizzes',
    listPath: '/admin/quizzes',
    createPath: '/admin/quizzes/create',
    icon: HelpCircle,
    color: 'from-rose-600 to-pink-600',
    badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
  },
  {
    id: 'interviewQuestions',
    title: 'Interview Questions',
    description: 'Technical interview challenges with revealed solutions',
    countKey: 'interviewQuestions',
    unit: 'Questions',
    listPath: '/admin/interview-questions',
    createPath: '/admin/interview-questions/create',
    icon: Flame,
    color: 'from-pink-600 to-purple-600',
    badgeColor: 'bg-pink-100 text-pink-700 border-pink-200',
  },
];

export default function AdminDashboard() {
  const { user } = useAuth();

  const [overview, setOverview] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [apiResponse, setApiResponse] = useState(null);
  const [testingApi, setTestingApi] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, usersRes] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/admin/users'),
      ]);
      setOverview(overviewRes.data.data);
      setUsersList(usersRes.data.data.users || []);
    } catch (err) {
      setError(err.message || 'Failed to load administrator data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const testAdminApi = async () => {
    setTestingApi(true);
    try {
      const res = await api.get('/admin/overview');
      setApiResponse({ status: 200, success: true, data: res.data });
    } catch (err) {
      setApiResponse({ status: err.status || 500, success: false, error: err.message });
    } finally {
      setTestingApi(false);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.role?.toLowerCase().includes(term)
    );
  });

  const contentMetrics = overview?.contentMetrics || {};
  const totalContent = overview?.metrics?.totalContentItems ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Shield className="w-64 h-64 text-purple-400" />
        </div>

        <div className="flex items-center space-x-5 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/30 backdrop-blur border border-purple-400/40 text-purple-300 font-extrabold flex items-center justify-center shadow-lg">
            <Shield className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Admin Master Control Center
              </h1>
              <span className="bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs px-2.5 py-0.5 rounded-full font-bold tracking-wider uppercase hidden sm:inline-block">
                PHASE 15
              </span>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Welcome back, {user?.name || 'Administrator'}. Manage all 9 curriculum and instructional domains, track platform metrics, and administer user roles.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 relative z-10 self-stretch sm:self-auto justify-end">
          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition disabled:opacity-50 shadow-sm gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Metrics</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Top 4 Executive Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Accounts
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {loading ? '...' : overview?.metrics?.totalUsers ?? usersList.length}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Administrators
            </div>
            <div className="text-2xl font-extrabold text-purple-900 mt-0.5">
              {loading ? '...' : overview?.metrics?.totalAdmins ?? usersList.filter((u) => u.role === 'ADMIN').length}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Content Units
            </div>
            <div className="text-2xl font-extrabold text-emerald-900 mt-0.5">
              {loading ? '...' : totalContent}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              System & Database
            </div>
            <div className="text-sm font-extrabold text-slate-900 mt-1 flex items-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1.5" />
              <span>{overview?.system?.databaseStatus || 'Connected'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Create Strip */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Fast Content Creation</span>
          </div>
          <span className="text-xs text-slate-500">1-Click Admin Jump</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {CONTENT_DOMAINS.map((domain) => {
            const Icon = domain.icon;
            return (
              <Link
                key={domain.createPath}
                to={domain.createPath}
                className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-300 text-xs font-semibold transition gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-purple-600" />
                <span>New {domain.unit.replace(/s$/, '')}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 9 Content Management Domains Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600" />
              <span>9 Content Management Domains</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Full administrative CRUD operations and inventory across the curriculum hierarchy
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CONTENT_DOMAINS.map((domain) => {
            const Icon = domain.icon;
            const count = contentMetrics[domain.countKey] ?? 0;

            return (
              <div
                key={domain.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200 transition flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${domain.color} text-white flex items-center justify-center shadow-md`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${domain.badgeColor}`}
                    >
                      {loading ? '...' : `${count} ${domain.unit}`}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition">
                      {domain.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                      {domain.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    to={domain.listPath}
                    className="inline-flex items-center px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition gap-1.5"
                  >
                    <span>Manage All</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>

                  <Link
                    to={domain.createPath}
                    className="inline-flex items-center px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lower Section: User Management & API Guard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Management Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center">
                <Users className="w-4 h-4 text-purple-600 mr-2" />
                User Management Directory
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Registered platform accounts and their authorization privileges
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-slate-400">
                      Loading user accounts...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-slate-400">
                      No matching users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.slice(0, 10).map((u) => {
                    const isAdm = u.role === 'ADMIN';
                    return (
                      <tr key={u._id} className="hover:bg-slate-50/75 transition">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                                isAdm
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-indigo-50 text-indigo-600'
                              }`}
                            >
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{u.name}</div>
                              <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                              isAdm
                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            }`}
                          >
                            {isAdm ? (
                              <Shield className="w-3 h-3 mr-1" />
                            ) : (
                              <UserCheck className="w-3 h-3 mr-1" />
                            )}
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
            <span>Showing {Math.min(filteredUsers.length, 10)} of {filteredUsers.length} users</span>
            <span className="text-[11px] text-slate-400">Manage via admin API endpoints</span>
          </div>
        </div>

        {/* Admin API Guard Inspector */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <Code2 className="w-4 h-4 text-purple-600 mr-2" />
              API Security Guard
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live validation of requireAuth & requireAdmin
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              As an authenticated <strong>ADMIN</strong>, you can request <code>/api/admin/overview</code> to receive system metrics and counts for all 9 content domains.
            </p>

            <button
              onClick={testAdminApi}
              disabled={testingApi}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{testingApi ? 'Executing API Call...' : 'Test GET /api/admin/overview'}</span>
            </button>

            {apiResponse && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Status:</span>
                  <span
                    className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] ${
                      apiResponse.status === 200
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    HTTP {apiResponse.status}
                  </span>
                </div>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-2xl text-[11px] font-mono overflow-x-auto shadow-inner max-h-52">
                  {JSON.stringify(apiResponse.data || apiResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
