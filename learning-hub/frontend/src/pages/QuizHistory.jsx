import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuizById } from '../features/quizzes/quizSlice';
import { fetchQuizAttempts } from '../features/quizAttempts/quizAttemptSlice';
import QuizHistoryTable from '../features/quizAttempts/components/QuizHistoryTable';
import QuizAttemptReviewModal from '../features/quizAttempts/components/QuizAttemptReviewModal';
import {
  ArrowLeft,
  Award,
  Clock,
  History,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  RefreshCw,
  Layers,
} from 'lucide-react';

export default function QuizHistory() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentQuiz: quiz, detailsLoading: quizLoading } = useSelector(
    (state) => state.quizzes
  );
  const {
    quizAttempts: attempts,
    quizStats: stats,
    loading: attemptsLoading,
    error,
  } = useSelector((state) => state.quizAttempts);

  const [reviewAttemptId, setReviewAttemptId] = useState(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchQuizById({ id }));
      dispatch(fetchQuizAttempts(id));
    }
  }, [dispatch, id]);

  const handleRetake = () => {
    navigate(`/quizzes/${id}`);
  };

  const selectedReviewAttempt = reviewAttemptId
    ? attempts.find((a) => a.id === reviewAttemptId || a._id === reviewAttemptId)
    : null;

  const loading = quizLoading || attemptsLoading;

  if (loading && !quiz) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto" />
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading quiz attempt history...</p>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Unable to load history</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
        <Link
          to="/learning-paths"
          className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Curriculum
        </Link>
      </div>
    );
  }

  const topic = quiz?.topic;
  const section = topic?.section;
  const moduleDoc = section?.module;
  const pathDoc = moduleDoc?.learningPath;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 5-Tier Breadcrumbs */}
      <nav className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
        {pathDoc && (
          <>
            <Link to={`/learning-paths/${pathDoc.slug}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              {pathDoc.title}
            </Link>
            <span>/</span>
          </>
        )}
        {moduleDoc && (
          <>
            <Link to={`/modules/${moduleDoc.slug}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              {moduleDoc.title}
            </Link>
            <span>/</span>
          </>
        )}
        {section && (
          <>
            <Link to={`/sections/${section.slug}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              {section.title}
            </Link>
            <span>/</span>
          </>
        )}
        {topic && (
          <>
            <Link to={`/topics/${topic.slug}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              {topic.title}
            </Link>
            <span>/</span>
          </>
        )}
        <Link
          to={`/quizzes/${quiz?.slug || id}`}
          className="text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-800 dark:hover:text-indigo-300 transition"
        >
          {quiz?.title || 'Quiz'}
        </Link>
        <span>/</span>
        <span className="text-slate-400 dark:text-slate-500">History</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-7 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/20 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-indigo-300" />
              Evaluation History
            </span>
            {stats?.hasPassed && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Mastered ✅
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {quiz?.title || 'Quiz Attempts History'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Review your historical attempts, scores, and answer breakdowns for this topic evaluation.
          </p>
        </div>

        <div>
          <Link
            to={`/quizzes/${quiz?.slug || id}`}
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Take Quiz Again</span>
          </Link>
        </div>
      </div>

      {/* Performance Summary Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
            <div className="text-[11px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
              Total Attempts
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
              {stats.totalAttempts}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
            <div className="text-[11px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
              Highest Score
            </div>
            <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
              {stats.bestScore} pts
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
            <div className="text-[11px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
              Best Percentage
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
              {stats.bestPercentage}%
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
            <div className="text-[11px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
              Passing Status
            </div>
            <div className="text-base font-extrabold mt-1.5">
              {stats.hasPassed ? (
                <span className="text-emerald-600 dark:text-emerald-400">Passed ✅</span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400">In Progress</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Attempt Records ({attempts?.length || 0})</span>
          </h2>
        </div>

        <QuizHistoryTable
          attempts={attempts}
          onSelectAttempt={(attId) => setReviewAttemptId(attId)}
          onRetake={handleRetake}
        />
      </div>

      {/* Review Modal */}
      {selectedReviewAttempt && (
        <QuizAttemptReviewModal
          attempt={selectedReviewAttempt}
          onClose={() => setReviewAttemptId(null)}
        />
      )}
    </div>
  );
}
