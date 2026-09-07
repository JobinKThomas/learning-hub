import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCurrentUser } from '../store/slices/authSlice';
import api from '../api/axios';
import {
  Server,
  Database,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Cpu,
  Clock,
  ShieldCheck,
  ArrowRight,
  BookOpen,
  Code2,
} from 'lucide-react';

export default function HomePage() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, token } = useSelector((state) => state.auth);

  const [health, setHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthError, setHealthError] = useState(null);
  const [latency, setLatency] = useState(null);
  const [protectedData, setProtectedData] = useState(null);
  const [testingProtected, setTestingProtected] = useState(false);

  const checkHealth = async () => {
    setHealthLoading(true);
    setHealthError(null);
    const start = performance.now();
    try {
      const response = await api.get('/health');
      const end = performance.now();
      setLatency(Math.round(end - start));
      setHealth(response.data.data);
    } catch (err) {
      setHealthError(err.message || 'Failed to connect to backend server');
      setHealth(null);
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    if (isAuthenticated && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [isAuthenticated, user, dispatch]);

  const testAuthEndpoint = async () => {
    setTestingProtected(true);
    try {
      const res = await api.get('/auth/me');
      setProtectedData(res.data.data.user);
    } catch (err) {
      setProtectedData({ error: err.message });
    } finally {
      setTestingProtected(false);
    }
  };

  const isBackendOnline = !!health && !healthError;
  const isMongoConnected = health?.database?.connected;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/30 backdrop-blur-sm border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-indigo-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Phase 0 — Project Foundation</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Learning Hub Platform
          </h1>
          <p className="text-indigo-100 text-base sm:text-lg leading-relaxed">
            Full-stack foundation successfully configured with Express, MongoDB, Mongoose,
            Authentication infrastructure, Swagger, React, Vite, Tailwind CSS, and Redux Toolkit.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <a
              href="http://localhost:5000/api-docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-white text-indigo-900 font-semibold text-sm hover:bg-indigo-50 transition shadow-sm"
            >
              <Code2 className="w-4 h-4 mr-2" />
              Interactive Swagger API Docs
            </a>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-semibold text-sm border border-indigo-400/40 transition"
              >
                Create Account
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Completion Criteria Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Backend Running */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              isBackendOnline ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
            }`}
          >
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Backend Server
            </div>
            <div className="text-base font-bold text-slate-900 flex items-center mt-0.5">
              {healthLoading ? (
                'Checking...'
              ) : isBackendOnline ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1.5" /> Running
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-500 mr-1.5" /> Offline
                </>
              )}
            </div>
          </div>
        </div>

        {/* MongoDB Connected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              isMongoConnected ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
            }`}
          >
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              MongoDB Database
            </div>
            <div className="text-base font-bold text-slate-900 flex items-center mt-0.5">
              {healthLoading ? (
                'Checking...'
              ) : isMongoConnected ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1.5" /> Connected
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-amber-500 mr-1.5" /> {health?.database?.status || 'Disconnected'}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Frontend Running */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Frontend Client
            </div>
            <div className="text-base font-bold text-slate-900 flex items-center mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1.5" /> Running (Vite)
            </div>
          </div>
        </div>

        {/* Frontend → Backend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              isBackendOnline ? 'bg-indigo-100 text-indigo-600' : 'bg-red-100 text-red-600'
            }`}
          >
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Frontend → Backend
            </div>
            <div className="text-base font-bold text-slate-900 flex items-center mt-0.5">
              {healthLoading ? (
                'Pinging...'
              ) : isBackendOnline ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 mr-1.5" /> Verified ({latency}ms)
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-500 mr-1.5" /> Failed
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Health Diagnostics Panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <Server className="w-5 h-5 text-indigo-600 mr-2" />
                Live Health Diagnostics (`GET /api/health`)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time API response from the backend server
              </p>
            </div>
            <button
              onClick={checkHealth}
              disabled={healthLoading}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${healthLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {healthLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm">Connecting to backend...</p>
            </div>
          ) : healthError ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm space-y-2">
              <div className="font-semibold flex items-center">
                <XCircle className="w-4 h-4 mr-1.5 text-red-500" />
                Backend Connection Error
              </div>
              <p className="text-xs font-mono">{healthError}</p>
              <p className="text-xs text-red-600">
                Ensure the backend is running with <code className="bg-red-100 px-1 py-0.5 rounded">npm run dev</code> inside <code className="bg-red-100 px-1 py-0.5 rounded">backend/</code>.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 block">Status</span>
                  <span className="text-sm font-bold text-emerald-600">{health?.status}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 block">Uptime</span>
                  <span className="text-sm font-semibold text-slate-800">{health?.uptimeHuman || `${health?.uptime}s`}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 block">Environment</span>
                  <span className="text-sm font-semibold text-slate-800 capitalize">{health?.environment}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 block">Node.js</span>
                  <span className="text-sm font-semibold text-slate-800">{health?.nodeVersion}</span>
                </div>
              </div>

              {/* Raw JSON viewer */}
              <div>
                <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Response Payload:
                </div>
                <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto shadow-inner">
                  {JSON.stringify(health, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Authentication & User Session Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <ShieldCheck className="w-5 h-5 text-indigo-600 mr-2" />
              Auth Infrastructure
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              JWT Bearer authentication state
            </p>
          </div>

          {isAuthenticated ? (
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{user?.name}</div>
                    <div className="text-xs text-slate-500">{user?.email}</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-indigo-100/60 flex items-center justify-between text-xs">
                  <span className="text-indigo-700 font-medium">Role: {user?.role}</span>
                  <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-semibold">Active Session</span>
                </div>
              </div>

              <button
                onClick={testAuthEndpoint}
                disabled={testingProtected}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition border border-indigo-200 flex items-center justify-center space-x-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{testingProtected ? 'Verifying...' : 'Verify Protected Route (/api/auth/me)'}</span>
              </button>

              {protectedData && (
                <div className="mt-3">
                  <div className="text-[11px] text-slate-500 font-medium mb-1">Protected Profile Response:</div>
                  <pre className="bg-slate-900 text-slate-200 p-3 rounded-lg text-[11px] font-mono overflow-x-auto">
                    {JSON.stringify(protectedData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                You are currently browsing as a guest. Test the authentication flow by registering a new account or logging in.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  className="w-full py-2.5 px-3 rounded-xl text-center text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="w-full py-2.5 px-3 rounded-xl text-center text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition"
                >
                  Register
                </Link>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1">
                <div className="font-semibold text-slate-700">Security Architecture:</div>
                <p>• Passwords salted and hashed with bcrypt</p>
                <p>• JWT Bearer tokens with expiration</p>
                <p>• Centralized Auth middleware</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
