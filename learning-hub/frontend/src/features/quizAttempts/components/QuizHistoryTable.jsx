import React from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Eye,
  RotateCcw,
} from 'lucide-react';

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '< 1 min';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
}

export default function QuizHistoryTable({
  attempts = [],
  onSelectAttempt,
  onRetake,
  showQuizTitle = false,
}) {
  if (!attempts || attempts.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm text-center space-y-3">
        <Award className="w-10 h-10 text-slate-300 mx-auto" />
        <h3 className="text-sm font-bold text-slate-800">No Past Attempts Yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          You haven't completed any evaluation attempts for this quiz yet.
        </p>
        {onRetake && (
          <button
            onClick={onRetake}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Start First Attempt
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Mobile Card Layout (sm:hidden) */}
      <div className="block sm:hidden divide-y divide-slate-100">
        {attempts.map((att) => {
          const dateStr = att.completedAt || att.createdAt;
          const formattedDate = dateStr
            ? new Date(dateStr).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Recent';

          return (
            <div key={att.id} className="p-4 space-y-3">
              {/* Header: Attempt # and Status Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-extrabold flex items-center justify-center border border-indigo-200 shrink-0">
                    #{att.attemptNumber}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 text-sm">Attempt {att.attemptNumber}</span>
                    {showQuizTitle && att.quiz?.title && (
                      <p className="text-xs text-slate-500 truncate max-w-[180px]">{att.quiz.title}</p>
                    )}
                  </div>
                </div>

                <div>
                  {att.passed ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Passed</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 gap-1">
                      <XCircle className="w-3 h-3 text-rose-600" />
                      <span>Failed</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs">
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Score</div>
                  <div className="font-bold text-slate-800 mt-0.5">{att.score} / {att.totalQuestions}</div>
                </div>
                <div className="border-x border-slate-200">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Result</div>
                  <div className="font-bold text-indigo-600 mt-0.5">{att.percentage}%</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Duration</div>
                  <div className="font-medium text-slate-700 mt-0.5">{formatDuration(att.timeSpentSeconds)}</div>
                </div>
              </div>

              {/* Footer: Date & Review CTA */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">{formattedDate}</span>
                <button
                  onClick={() => onSelectAttempt(att.id)}
                  className="inline-flex items-center px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-semibold transition gap-1.5 min-h-[36px]"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Review</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop & Tablet Tabular Layout (hidden sm:block) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5">Attempt</th>
              {showQuizTitle && <th className="px-5 py-3.5">Quiz</th>}
              <th className="px-5 py-3.5">Score</th>
              <th className="px-5 py-3.5">Percentage</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Time Spent</th>
              <th className="px-5 py-3.5">Date & Time</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {attempts.map((att) => {
              const dateStr = att.completedAt || att.createdAt;
              const formattedDate = dateStr
                ? new Date(dateStr).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Recent';

              return (
                <tr key={att.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-extrabold flex items-center justify-center border border-indigo-200">
                        #{att.attemptNumber}
                      </span>
                      <span>Attempt {att.attemptNumber}</span>
                    </span>
                  </td>

                  {showQuizTitle && (
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">
                        {att.quiz?.title || 'Knowledge Quiz'}
                      </div>
                      {att.quiz?.topic && (
                        <div className="text-[10px] text-slate-400">
                          {att.quiz.topic.title}
                        </div>
                      )}
                    </td>
                  )}

                  <td className="px-5 py-4">
                    <span className="font-semibold text-slate-800">
                      {att.score} / {att.totalQuestions}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="font-bold text-slate-900">
                      {att.percentage}%
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">
                      (Pass: {att.passingScore}%)
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    {att.passed ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Passed ✅</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 gap-1">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        <span>Failed ❌</span>
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDuration(att.timeSpentSeconds)}</span>
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-slate-500 text-[11px]">
                      {formattedDate}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => onSelectAttempt(att.id)}
                      className="inline-flex items-center px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-slate-700 text-xs font-semibold transition gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
