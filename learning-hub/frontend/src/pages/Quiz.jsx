import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchQuizById,
  clearSubmissionResult,
  clearCurrentQuiz,
} from '../features/quizzes/quizSlice';
import {
  submitQuizAttempt,
  fetchQuizAttempts,
  clearCurrentAttempt,
} from '../features/quizAttempts/quizAttemptSlice';
import QuestionCard from '../features/quizzes/components/QuestionCard';
import QuizResultView from '../features/quizzes/components/QuizResultView';
import QuizHistoryTable from '../features/quizAttempts/components/QuizHistoryTable';
import QuizAttemptReviewModal from '../features/quizAttempts/components/QuizAttemptReviewModal';
import { useAuth } from '../hooks/useAuth';
import {
  ArrowLeft,
  ArrowRight,
  Send,
  AlertCircle,
  Clock,
  HelpCircle,
  Award,
  Edit,
  History,
  RotateCcw,
  CheckCircle2,
  Play,
} from 'lucide-react';

export default function Quiz() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const {
    currentQuiz: quiz,
    detailsLoading: loading,
    error,
  } = useSelector((state) => state.quizzes);

  const {
    quizAttempts,
    quizStats,
    currentAttempt,
    submitting,
  } = useSelector((state) => state.quizAttempts);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showWarning, setShowWarning] = useState(false);
  const [activeTab, setActiveTab] = useState('take'); // 'take' | 'history'
  const [startTime, setStartTime] = useState(Date.now());
  const [reviewAttemptId, setReviewAttemptId] = useState(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchQuizById({ id }));
      dispatch(fetchQuizAttempts(id));
      setStartTime(Date.now());
    }
    return () => {
      dispatch(clearCurrentQuiz());
      dispatch(clearCurrentAttempt());
    };
  }, [dispatch, id]);

  const questions = quiz?.questions || [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (optionIndex) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
    setShowWarning(false);
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < totalQuestions && !showWarning) {
      setShowWarning(true);
      return;
    }

    const timeSpentSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    await dispatch(
      submitQuizAttempt({
        quizId: quiz.id,
        answers,
        timeSpentSeconds,
        startedAt: new Date(startTime).toISOString(),
      })
    );

    // Refresh attempts list
    dispatch(fetchQuizAttempts(quiz.id));
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentIndex(0);
    setShowWarning(false);
    setStartTime(Date.now());
    dispatch(clearCurrentAttempt());
    setActiveTab('take');
  };

  const handleOpenReview = (attemptId) => {
    setReviewAttemptId(attemptId);
  };

  const handleCloseReview = () => {
    setReviewAttemptId(null);
  };

  const selectedReviewAttempt = reviewAttemptId
    ? quizAttempts.find((a) => (a.id === reviewAttemptId || a._id === reviewAttemptId)) ||
      (currentAttempt?.id === reviewAttemptId ? currentAttempt : null)
    : null;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="h-6 bg-slate-200 rounded w-48 animate-pulse" />
        <div className="h-24 bg-slate-200 rounded-3xl animate-pulse" />
        <div className="h-80 bg-slate-200 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Quiz Not Found</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          {error || `The quiz could not be loaded.`}
        </p>
        <div>
          <Link
            to="/learning-paths"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Curriculum
          </Link>
        </div>
      </div>
    );
  }

  // 5-Tier Hierarchy
  const topic = quiz.topic;
  const section = topic?.section;
  const moduleDoc = section?.module;
  const pathDoc = moduleDoc?.learningPath;

  const progressPercent = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 5-Tier Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500">
          {pathDoc && (
            <>
              <Link to={`/learning-paths/${pathDoc.slug}`} className="hover:text-indigo-600 transition">
                {pathDoc.title}
              </Link>
              <span>/</span>
            </>
          )}
          {moduleDoc && (
            <>
              <Link to={`/modules/${moduleDoc.slug}`} className="hover:text-indigo-600 transition">
                {moduleDoc.title}
              </Link>
              <span>/</span>
            </>
          )}
          {section && (
            <>
              <Link to={`/sections/${section.slug}`} className="hover:text-indigo-600 transition">
                {section.title}
              </Link>
              <span>/</span>
            </>
          )}
          {topic ? (
            <Link
              to={`/topics/${topic.slug}`}
              className="inline-flex items-center text-indigo-600 font-bold hover:text-indigo-800 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              {topic.title}
            </Link>
          ) : (
            <Link to="/learning-paths" className="hover:text-indigo-600 transition">
              Curriculum
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              to={`/admin/quizzes/${quiz.id}/edit`}
              className="inline-flex items-center px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold transition"
            >
              <Edit className="w-3.5 h-3.5 mr-1.5" />
              Edit Quiz (Admin)
            </Link>
          )}
        </div>
      </div>

      {/* Tabs Header (Take Quiz vs Past Attempts) */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('take')}
            className={`inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-bold transition gap-1.5 ${
              activeTab === 'take'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{currentAttempt ? 'Latest Result' : 'Take Quiz'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-bold transition gap-1.5 ${
              activeTab === 'history'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Past Attempts ({quizAttempts?.length || 0})</span>
          </button>
        </div>

        {quizStats?.hasPassed && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Mastered (Best: {quizStats.bestPercentage}%)</span>
          </span>
        )}
      </div>

      {/* VIEW 1: History Tab */}
      {activeTab === 'history' ? (
        <div className="space-y-6">
          {/* Summary Stats Banner */}
          {quizStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Attempts</div>
                <div className="text-xl font-extrabold text-slate-900 mt-1">{quizStats.totalAttempts}</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Highest Score</div>
                <div className="text-xl font-extrabold text-indigo-600 mt-1">{quizStats.bestScore} pts</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Best %</div>
                <div className="text-xl font-extrabold text-slate-900 mt-1">{quizStats.bestPercentage}%</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Passing Status</div>
                <div className="text-sm font-bold mt-1.5">
                  {quizStats.hasPassed ? (
                    <span className="text-emerald-600">Passed ✅</span>
                  ) : (
                    <span className="text-amber-600">In Progress</span>
                  )}
                </div>
              </div>
            </div>
          )}

          <QuizHistoryTable
            attempts={quizAttempts}
            onSelectAttempt={handleOpenReview}
            onRetake={handleRetake}
          />
        </div>
      ) : currentAttempt ? (
        /* VIEW 2: Newly Finished Attempt Results Screen */
        <QuizResultView
          evaluation={currentAttempt}
          onRetake={handleRetake}
          onViewHistory={() => setActiveTab('history')}
          topicSlug={topic?.slug}
          topicTitle={topic?.title}
          quizId={quiz.id}
        />
      ) : (
        /* VIEW 3: Active Quiz Runner Stepper: Question 1 -> Question 2 -> Question 3 -> Submit */
        <div className="space-y-6">
          {/* Quiz Header Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-indigo-600" />
                Knowledge Evaluation
              </span>

              <div className="flex items-center space-x-3 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{quiz.timeLimitMinutes || 5} mins</span>
                </div>
                <span>•</span>
                <span className="font-semibold text-indigo-600">
                  Passing Score: {quiz.passingScore || 70}%
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {quiz.title}
              </h1>
              {quiz.description && (
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {quiz.description}
                </p>
              )}
            </div>

            {/* Stepper Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>
                  Question {currentIndex + 1} of {totalQuestions}
                </span>
                <span>
                  {answeredCount} of {totalQuestions} Answered
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Active Question Card */}
          {currentQuestion ? (
            <QuestionCard
              question={currentQuestion}
              currentIndex={currentIndex}
              totalQuestions={totalQuestions}
              selectedOption={answers[currentQuestion.id]}
              onSelectOption={handleSelectOption}
            />
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-500 text-xs">
              No questions found in this quiz.
            </div>
          )}

          {/* Unanswered Warning if triggered */}
          {showWarning && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">You have unanswered questions!</span>
                <p className="mt-0.5">
                  You have answered {answeredCount} out of {totalQuestions} questions. Are you sure you want to submit now? Click Submit again to confirm.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition disabled:opacity-30 disabled:pointer-events-none gap-1.5 min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-2">
              {currentIndex < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center justify-center px-5 sm:px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition gap-1.5 min-h-[44px]"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex items-center justify-center px-5 sm:px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition gap-1.5 disabled:opacity-50 min-h-[44px]"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Grading...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{showWarning ? 'Confirm & Submit' : 'Submit Quiz'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal for past attempts */}
      {selectedReviewAttempt && (
        <QuizAttemptReviewModal
          attempt={selectedReviewAttempt}
          onClose={handleCloseReview}
        />
      )}
    </div>
  );
}
