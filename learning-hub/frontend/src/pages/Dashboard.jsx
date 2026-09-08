import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../hooks/useAuth';
import { fetchDashboardData } from '../features/dashboard/dashboardSlice';
import DashboardCards from '../features/dashboard/components/DashboardCards';
import ContinueLearning from '../features/dashboard/components/ContinueLearning';
import ProgressOverview from '../features/dashboard/components/ProgressOverview';
import QuizHistoryTable from '../features/quizAttempts/components/QuizHistoryTable';
import QuizAttemptReviewModal from '../features/quizAttempts/components/QuizAttemptReviewModal';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { normalizeList } from '../utils/normalize';
import {
  User,
  Shield,
  LogOut,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Mail,
  History,
  RotateCcw,
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, role, isAdmin, logout } = useAuth();
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError } = useSelector(
    (state) => state.dashboard
  );

  const [reviewAttemptId, setReviewAttemptId] = useState(null);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const handleLogout = async () => {
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

  const stats = dashboardData?.stats;
  const continueLearning = dashboardData?.continueLearning;
  const learningPaths = normalizeList(dashboardData?.learningPaths);
  const recentQuizAttempts = normalizeList(dashboardData?.recentQuizAttempts);

  if (dashboardLoading && !dashboardData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <LoadingState variant="cards" count={3} />
      </div>
    );
  }

  if (dashboardError && !dashboardData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ErrorState
          title="Unable to load learning dashboard."
          message={dashboardError || "Please try again."}
          onRetry={() => dispatch(fetchDashboardData())}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Learning Dashboard Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center space-x-4 sm:space-x-5">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-white font-extrabold text-xl sm:text-2xl flex items-center justify-center shadow-lg shrink-0">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
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
            <p className="text-indigo-200 text-xs sm:text-sm mt-1">
              Welcome back, {user?.name || 'Learner'}! Track your progress and resume your active track.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          <button
            onClick={() => dispatch(fetchDashboardData())}
            className="inline-flex items-center justify-center px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition min-h-[44px] flex-1 sm:flex-initial"
            title="Refresh Dashboard"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            <span>Refresh</span>
          </button>
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold shadow-md transition min-h-[44px] flex-1 sm:flex-initial"
            >
              <Shield className="w-4 h-4 mr-1.5" />
              <span>Admin Console</span>
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white border border-red-400/30 text-xs sm:text-sm font-semibold transition min-h-[44px] w-full sm:w-auto"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* 1. DashboardCards: Welcome & Core 4-Metric Grid (Phase 14) */}
      <DashboardCards user={dashboardData?.user || user} stats={stats} />

      {/* 2. Main Grid: Continue Learning + Track Overview (Phase 14) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Continue Learning Card */}
        <div className="lg:col-span-1 h-full">
          <ContinueLearning item={continueLearning} />
        </div>

        {/* Progress Overview across Tracks */}
        <div className="lg:col-span-2">
          <ProgressOverview learningPaths={learningPaths} />
        </div>
      </div>

      {/* 3. Learner Profile Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center">
            <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mr-2" />
            Learner Profile
          </h2>
          <span className="text-xs bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold px-2.5 py-0.5 rounded-full flex items-center">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Active Account
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 text-sm">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 flex items-center text-xs mb-1">
              <User className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Full Name
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">{user?.name}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 flex items-center text-xs mb-1">
              <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Email Address
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-xs block truncate">{user?.email}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 flex items-center text-xs mb-1">
              <Shield className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Assigned Role
            </span>
            <span
              className={`inline-block font-semibold font-mono text-xs px-2 py-0.5 rounded ${
                isAdmin
                  ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                  : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
              }`}
            >
              {role || 'USER'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 flex items-center text-xs mb-1">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Member Since
            </span>
            <span className="font-medium text-slate-700 dark:text-slate-300 block">{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* 4. Recent Quiz Attempts Section */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Recent Knowledge Quiz Attempts ({recentQuizAttempts?.length || 0})
            </h2>
          </div>
        </div>

        <QuizHistoryTable
          attempts={recentQuizAttempts}
          showQuizTitle={true}
          onSelectAttempt={(attId) => setReviewAttemptId(attId)}
        />
      </div>

      {/* Modal for reviewing past attempt */}
      {reviewAttemptId && (
        <QuizAttemptReviewModal
          attempt={recentQuizAttempts.find((a) => a.id === reviewAttemptId || a._id === reviewAttemptId)}
          onClose={() => setReviewAttemptId(null)}
        />
      )}
    </div>
  );
}
