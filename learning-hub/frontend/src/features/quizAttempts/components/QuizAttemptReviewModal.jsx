import React from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Terminal,
  Award,
  Calendar,
} from 'lucide-react';

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '< 1 min';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
}

export default function QuizAttemptReviewModal({ attempt, onClose }) {
  if (!attempt) return null;

  const dateStr = attempt.completedAt || attempt.createdAt;
  const formattedDate = dateStr
    ? new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recent Attempt';

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200/80 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                Attempt #{attempt.attemptNumber}
              </span>
              {attempt.passed ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Passed ✅
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  Failed ❌
                </span>
              )}
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {attempt.quiz?.title || 'Quiz Evaluation Review'}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-indigo-500" />
                <span>
                  Score: <strong>{attempt.score} / {attempt.totalQuestions}</strong> ({attempt.percentage}%)
                </span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatDuration(attempt.timeSpentSeconds)}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{formattedDate}</span>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
            title="Close review"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable list of questions */}
        <div className="p-6 overflow-y-auto space-y-6">
          {(attempt.answers || []).map((ans, idx) => {
            const isCorrect = ans.isCorrect;

            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl border transition-all ${
                  isCorrect
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-rose-200 bg-rose-50/20'
                }`}
              >
                {/* Question Prompt Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                        isCorrect
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {ans.question}
                    </h3>
                  </div>

                  {isCorrect ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                      +1 Correct
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 shrink-0">
                      Incorrect
                    </span>
                  )}
                </div>

                {/* Code Snippet if present */}
                {ans.codeSnippet && (
                  <pre className="mb-4 p-4 rounded-xl bg-slate-950 text-emerald-400 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                    <code>{ans.codeSnippet}</code>
                  </pre>
                )}

                {/* Options Breakdown */}
                <div className="space-y-2 mb-3">
                  {(ans.options || []).map((opt, optIdx) => {
                    const isSelected = ans.selectedOption === optIdx;
                    const isTheCorrectAnswer = ans.correctAnswer === optIdx;
                    const letter = optionLetters[optIdx] || optIdx + 1;

                    let optBg = 'bg-white border-slate-200 text-slate-700';
                    if (isTheCorrectAnswer) {
                      optBg = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold';
                    } else if (isSelected && !isTheCorrectAnswer) {
                      optBg = 'bg-rose-50 border-rose-300 text-rose-900 font-semibold';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${optBg}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center ${
                              isTheCorrectAnswer
                                ? 'bg-emerald-600 text-white'
                                : isSelected
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {letter}
                          </span>
                          <span>{opt}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
                          {isSelected && !isTheCorrectAnswer && (
                            <span className="text-rose-600 font-bold flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Your Choice
                            </span>
                          )}
                          {isTheCorrectAnswer && (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Correct Answer
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {ans.explanation && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <strong className="text-slate-900">Explanation: </strong>
                      {ans.explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold transition"
          >
            Close Review
          </button>
        </div>
      </div>
    </div>
  );
}
