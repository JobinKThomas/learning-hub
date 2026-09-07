import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../hooks/useAuth';
import authApi from '../api/authApi';
import { fetchMyAttempts } from '../features/quizAttempts/quizAttemptSlice';
import { fetchOverallProgress } from '../features/progress/progressSlice';
import ProgressBar from '../features/progress/components/ProgressBar';
import QuizHistoryTable from '../features/quizAttempts/components/QuizHistoryTable';
import QuizAttemptReviewModal from '../features/quizAttempts/components/QuizAttemptReviewModal';
import {
  User,
  Shield,
  Key,
  LogOut,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Mail,
  BookOpen,
  GraduationCap,
  Award,
  ArrowRight,
  History,
  CheckSquare,
  Play,
  Flame,
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, role, isAdmin, accessToken, refreshToken, logout } = useAuth();
  const { myAttempts, loading: attemptsLoading } = useSelector((state) => state.quizAttempts);
  const { overallProgress } = useSelector((state) => state.progress);

  const [testResponse, setTestResponse] = useState(null);
  const [testingApi, setTestingApi] = useState(false);
  const [reviewAttemptId, setReviewAttemptId] = useState(null);

  useEffect(() => {
    dispatch(fetchMyAttempts({ limit: 5 }));
    dispatch(fetchOverallProgress());
  }, [dispatch]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleTestProtected = async () => {
    setTestingApi(true);
    try {
      const res = await authApi.getMe();
      setTestResponse({ success: true, data: res.data });
    } catch (err) {
      setTestResponse({ success: false, error: err.message });
    } finally {
      setTestingApi(false);
    }
  };

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recently';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Learning Dashboard Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center space-x-5">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Learning Dashboard
              </h1>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wide ${
                  isAdmin
                    ? 'bg-purple-500/30 text-purple-200 border border-purple-300/30'
                    : 'bg-indigo-500/40 text-indigo-200 border border-indigo-300/30'
                }`}
              >
                {role || 'USER'}
              </span>
            </div>
            <p className="text-indigo-200 text-sm mt-1">
              Welcome back, {user?.name || 'Learner'}! Track your progress and manage your account.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-md transition"
            >
              <Shield className="w-4 h-4 mr-1.5" />
              Switch to Admin Dashboard
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white border border-red-400/30 text-sm font-semibold transition"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </button>
        </div>
      </div>

      {/* Learning Progress Summary Grid (Phase 13) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Topics Mastered
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {overallProgress?.totalCompletedTopics ?? 0}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Notes Read
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {overallProgress?.totalCompletedNotes ?? 0}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Quizzes Passed
            </div>
            <div className="text-2xl font-extrabold text-purple-900 mt-0.5">
              {overallProgress?.totalCompletedQuizzes ?? 0}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Play className="w-6 h-6 fill-current text-amber-500" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Playgrounds Run
            </div>
            <div className="text-2xl font-extrabold text-amber-900 mt-0.5">
              {overallProgress?.totalCompletedPlaygrounds ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Track Progress Overview (Phase 13) */}
      {overallProgress?.learningPaths && overallProgress.learningPaths.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                Track Progress & Milestones
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time completion tracking across learning paths
              </p>
            </div>
            <Link
              to="/learning-paths"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition self-start sm:self-auto"
            >
              Explore all paths →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {overallProgress.learningPaths.map((lp) => (
              <div
                key={lp.id || lp.slug}
                className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-sm transition space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 line-clamp-1">
                    {lp.title}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {lp.completedTopics} / {lp.totalTopics} topics
                  </span>
                </div>
                <ProgressBar
                  percentage={lp.percentage}
                  size="sm"
                  variant="auto"
                  showLabel={false}
                />
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-600 font-semibold">
                    {lp.percentage}% mastered
                  </span>
                  <Link
                    to={`/learning-paths/${lp.slug}`}
                    className="font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <span>Resume Track</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured Learning Path Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200">
            Featured Curriculum
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            JavaScript Masterclass: From Fundamentals to Asynchronous & ES6+
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            4 comprehensive modules covering syntax, event loop, Promises, DOM manipulation, prototypes, and functional patterns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/learning-paths/javascript"
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition"
          >
            <span>Start JavaScript Path</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
          <Link
            to="/learning-paths"
            className="inline-flex items-center px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
          >
            Browse All Paths
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <User className="w-4 h-4 text-indigo-600 mr-2" />
              Learner Profile
            </h2>
            <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Active
            </span>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex items-start justify-between">
              <span className="text-slate-500 flex items-center text-xs">
                <User className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Full Name
              </span>
              <span className="font-semibold text-slate-800">{user?.name}</span>
            </div>

            <div className="flex items-start justify-between">
              <span className="text-slate-500 flex items-center text-xs">
                <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Email Address
              </span>
              <span className="font-semibold text-slate-800 font-mono text-xs">{user?.email}</span>
            </div>

            <div className="flex items-start justify-between">
              <span className="text-slate-500 flex items-center text-xs">
                <Shield className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Assigned Role
              </span>
              <span
                className={`font-semibold font-mono text-xs px-2 py-0.5 rounded ${
                  isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-indigo-50 text-indigo-700'
                }`}
              >
                {role || 'USER'}
              </span>
            </div>

            <div className="flex items-start justify-between">
              <span className="text-slate-500 flex items-center text-xs">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Member Since
              </span>
              <span className="font-medium text-slate-700">{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Active Session & Tokens Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center">
                <Key className="w-4 h-4 text-indigo-600 mr-2" />
                Active Dual-JWT Session
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Redux Toolkit state authenticated with role-based scope
              </p>
            </div>
            <button
              onClick={handleTestProtected}
              disabled={testingApi}
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold border border-indigo-200 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${testingApi ? 'animate-spin' : ''}`} />
              Test GET /api/auth/me
            </button>
          </div>

          <div className="space-y-4">
            {/* Access Token */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                <span>Access Token (Bearer Header)</span>
                <span className="text-indigo-600 font-mono text-[10px]">15m expiry</span>
              </div>
              <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-xs overflow-x-auto shadow-inner break-all">
                {accessToken || 'None'}
              </div>
            </div>

            {/* Refresh Token */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                <span>Refresh Token (Secure Invalidation)</span>
                <span className="text-indigo-600 font-mono text-[10px]">7d expiry</span>
              </div>
              <div className="bg-slate-900 text-amber-300 p-3 rounded-xl font-mono text-xs overflow-x-auto shadow-inner break-all">
                {refreshToken || 'None'}
              </div>
            </div>

            {/* Test response panel */}
            {testResponse && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center">
                  {testResponse.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500 mr-1.5" />
                  )}
                  API Response from <code>GET /api/auth/me</code>:
                </div>
                <pre className="bg-slate-900 text-slate-200 p-3 rounded-xl text-xs font-mono overflow-x-auto">
                  {JSON.stringify(testResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Quiz Attempts & Knowledge Evaluation Section */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Recent Knowledge Quiz Attempts ({myAttempts?.length || 0})
            </h2>
          </div>
        </div>

        <QuizHistoryTable
          attempts={myAttempts}
          showQuizTitle={true}
          onSelectAttempt={(attId) => setReviewAttemptId(attId)}
        />
      </div>

      {/* Modal for reviewing past attempt */}
      {reviewAttemptId && (
        <QuizAttemptReviewModal
          attempt={myAttempts.find((a) => a.id === reviewAttemptId || a._id === reviewAttemptId)}
          onClose={() => setReviewAttemptId(null)}
        />
      )}
    </div>
  );
}
