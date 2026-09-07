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
  Clock,
  Server,
  Database,
  CheckCircle2,
  AlertCircle,
  Code2,
  Layers,
  FileText,
  BookOpen,
  Link2,
  Terminal,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();

  const [overview, setOverview] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-slate-800">
        <div className="flex items-center space-x-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 backdrop-blur border border-indigo-400/30 text-indigo-300 font-extrabold flex items-center justify-center shadow-lg">
            <Shield className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Console</h1>
              <span className="bg-red-500/20 text-red-300 border border-red-400/30 text-xs px-2.5 py-0.5 rounded-full font-bold tracking-wider uppercase">
                ADMIN PRIVILEGES
              </span>
            </div>
            <p className="text-slate-300 text-sm mt-1">
              Welcome back, {user?.name}. Manage platform users, review roles, and monitor system metrics.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/learning-paths"
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition"
          >
            <Layers className="w-3.5 h-3.5 mr-1.5" />
            Paths
          </Link>
          <Link
            to="/admin/modules"
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold shadow-md shadow-purple-700/30 transition"
          >
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            Modules
          </Link>
          <Link
            to="/admin/sections"
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-purple-800 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-800/30 transition"
          >
            <Layers className="w-3.5 h-3.5 mr-1.5" />
            Sections
          </Link>
          <Link
            to="/admin/topics"
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-semibold shadow-md shadow-purple-900/30 transition"
          >
            <Code2 className="w-3.5 h-3.5 mr-1.5" />
            Topics
          </Link>
          <Link
            to="/admin/notes"
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 text-white text-xs font-semibold shadow-md shadow-purple-950/30 transition"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            Notes
          </Link>
          <Link
            to="/admin/resources"
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-700/30 transition"
          >
            <Link2 className="w-3.5 h-3.5 mr-1.5" />
            Resources
          </Link>
          <Link
            to="/admin/playgrounds"
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-indigo-800 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-800/30 transition"
          >
            <Terminal className="w-3.5 h-3.5 mr-1.5" />
            Playgrounds
          </Link>
          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Accounts
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {loading ? '...' : overview?.metrics?.totalUsers ?? usersList.length}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Administrators
            </div>
            <div className="text-2xl font-bold text-purple-900 mt-0.5">
              {loading ? '...' : overview?.metrics?.totalAdmins ?? usersList.filter(u => u.role === 'ADMIN').length}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Standard Users
            </div>
            <div className="text-2xl font-bold text-emerald-900 mt-0.5">
              {loading ? '...' : overview?.metrics?.standardUsers ?? usersList.filter(u => u.role !== 'ADMIN').length}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              API & DB Status
            </div>
            <div className="text-base font-bold text-slate-900 mt-0.5 flex items-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1.5" />
              {overview?.system?.databaseStatus || 'Connected'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Sections: Users Table & API Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Management Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center">
                <Users className="w-4 h-4 text-indigo-600 mr-2" />
                User Management Directory
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Registered platform accounts and their assigned authorization roles
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {usersList.length} total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-slate-400">
                      Loading user accounts...
                    </td>
                  </tr>
                ) : usersList.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-slate-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  usersList.map((u) => {
                    const isAdm = u.role === 'ADMIN';
                    return (
                      <tr key={u._id} className="hover:bg-slate-50/75 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                                isAdm
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-indigo-50 text-indigo-600'
                              }`}
                            >
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{u.name}</div>
                              <div className="text-xs text-slate-500 font-mono">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
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
                        <td className="px-6 py-4 text-xs text-slate-500">
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
        </div>

        {/* Admin API Inspector */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <Code2 className="w-4 h-4 text-indigo-600 mr-2" />
              Admin API Guard Inspector
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live validation of requireAuth & requireAdmin
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              As an authenticated <strong>ADMIN</strong>, you can request <code>/api/admin/overview</code> and receive HTTP 200. Standard users receive HTTP 403 Forbidden.
            </p>

            <button
              onClick={testAdminApi}
              disabled={testingApi}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{testingApi ? 'Executing API Call...' : 'Execute GET /api/admin/overview'}</span>
            </button>

            {apiResponse && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Response Status:</span>
                  <span
                    className={`font-bold font-mono px-2 py-0.5 rounded ${
                      apiResponse.status === 200
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    HTTP {apiResponse.status}
                  </span>
                </div>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl text-[11px] font-mono overflow-x-auto shadow-inner">
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
