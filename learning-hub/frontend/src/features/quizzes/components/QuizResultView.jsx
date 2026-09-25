import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowLeft,
  Sparkles,
  Award,
  HelpCircle,
  Clock,
  History,
} from 'lucide-react';

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return null;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
}

export default function QuizResultView({
  evaluation,
  onRetake,
  onViewHistory,
  topicSlug,
  topicTitle,
  quizId,
}) {
  if (!evaluation) return null;

  const {
    score,
    totalQuestions,
    percentage,
    passingScore,
    passed,
    attemptNumber,
    timeSpentSeconds,
  } = evaluation;

  const results = evaluation.results || evaluation.answers || [];
  const durationText = formatDuration(timeSpentSeconds);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Result Score Banner */}
      <div
        className={`rounded-3xl p-8 text-center border shadow-xl space-y-4 ${
          passed
            ? 'bg-gradient-to-b from-emerald-900 via-slate-900 to-slate-950 border-emerald-500/30 text-white'
            : 'bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 border-rose-500/30 text-white'
        }`}
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/10 mb-2">
          {passed ? (
            <Award className="w-8 h-8 text-emerald-400" />
          ) : (
            <XCircle className="w-8 h-8 text-rose-400" />
          )}
        </div>

        {/* Score & Percentage */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-300">
              Quiz Result
            </span>
            {attemptNumber && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/20">
                Attempt #{attemptNumber}
              </span>
            )}
            {durationText && (
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 flex items-center gap-1 border border-white/10">
                <Clock className="w-3 h-3 text-amber-300" />
                <span>{durationText}</span>
              </span>
            )}
          </div>
          <div className="text-4xl sm:text-5xl font-extrabold tracking-tight font-sans">
            Score: {score} / {totalQuestions}
          </div>
          <div className="text-3xl font-bold text-slate-200">
            {percentage}%
          </div>
        </div>

        {/* Status Badge */}
        <div className="pt-2">
          <span
            className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-extrabold tracking-wide uppercase ${
              passed
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                : 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
            }`}
          >
            {passed ? 'Passed ✅' : 'Failed ❌'}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed pt-2">
          {passed
            ? 'Great job! You have demonstrated strong mastery of this topic concept.'
            : `You need at least ${passingScore}% to pass this quiz. Review the detailed explanations below and try again.`}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={onRetake}
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs shadow-md transition gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Quiz</span>
          </button>

          {onViewHistory && (
            <button
              type="button"
              onClick={onViewHistory}
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-indigo-600/60 hover:bg-indigo-600 text-white font-bold text-xs border border-indigo-400/40 shadow-md transition gap-1.5"
            >
              <History className="w-3.5 h-3.5 text-indigo-200" />
              <span>Quiz History</span>
            </button>
          )}

          {quizId && !onViewHistory && (
            <Link
              to={`/quizzes/${quizId}/history`}
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-indigo-600/60 hover:bg-indigo-600 text-white font-bold text-xs border border-indigo-400/40 shadow-md transition gap-1.5"
            >
              <History className="w-3.5 h-3.5 text-indigo-200" />
              <span>Quiz History</span>
            </Link>
          )}

          {topicSlug && (
            <Link
              to={`/topics/${topicSlug}`}
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 transition gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to {topicTitle || 'Topic'}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Itemized Questions Breakdown & Explanations */}
      {results && results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Detailed Question Review & Explanations
            </h3>
          </div>

          <div className="space-y-4">
            {results.map((res, idx) => (
              <div
                key={idx}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border shadow-sm space-y-4 ${
                  res.isCorrect
                    ? 'border-emerald-200/80 dark:border-emerald-800/80'
                    : 'border-rose-200/80 dark:border-rose-800/80'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 font-mono">
                    Question {res.questionIndex || idx + 1}
                  </span>

                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      res.isCorrect
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    {res.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600 dark:text-emerald-400" />
                        Correct
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 mr-1 text-rose-600 dark:text-rose-400" />
                        Incorrect
                      </>
                    )}
                  </span>
                </div>

                {/* Question */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {res.question}
                  </h4>
                  {res.codeSnippet && (
                    <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto leading-relaxed border border-slate-800">
                      <code>{res.codeSnippet}</code>
                    </pre>
                  )}
                </div>

                {/* Answers Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  <div
                    className={`p-3 rounded-xl border ${
                      res.isCorrect
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : 'bg-rose-50/50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                    }`}
                  >
                    <span className="block text-[10px] font-bold uppercase tracking-wider opacity-70 mb-0.5">
                      Your Answer:
                    </span>
                    <span className="font-semibold">
                      {res.selectedOptionText || '(Not answered)'}
                    </span>
                  </div>

                  {!res.isCorrect && (
                    <div className="p-3 rounded-xl border bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
                      <span className="block text-[10px] font-bold uppercase tracking-wider opacity-70 mb-0.5">
                        Correct Answer:
                      </span>
                      <span className="font-semibold">
                        {res.correctAnswerText || 'Option ' + (res.correctAnswer + 1)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Explanation */}
                {res.explanation && (
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    <div className="flex items-center space-x-1.5 font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                      <span>Explanation:</span>
                    </div>
                    <p className="leading-relaxed pl-5">{res.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
