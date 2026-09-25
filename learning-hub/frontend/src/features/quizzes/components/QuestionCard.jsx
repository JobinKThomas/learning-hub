import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  selectedOption,
  onSelectOption,
}) {
  if (!question) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 sm:space-y-6">
      {/* Question Header */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3">
        <span className="uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold">
          Question {currentIndex + 1} of {totalQuestions}
        </span>
        <span className="text-slate-400 dark:text-slate-500">Multiple Choice</span>
      </div>

      {/* Question Text */}
      <div className="space-y-3">
        <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
          {question.question}
        </h2>

        {/* Optional Code Snippet */}
        {question.codeSnippet && (
          <pre className="p-3 sm:p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl sm:rounded-2xl overflow-x-auto leading-relaxed border border-slate-800">
            <code>{question.codeSnippet}</code>
          </pre>
        )}
      </div>

      {/* Options List */}
      <div className="space-y-2.5 sm:space-y-3 pt-2">
        {question.options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          const letter = OPTION_LETTERS[idx] || `${idx + 1}`;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectOption(idx)}
              className={`w-full text-left p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-3 sm:gap-4 group min-h-[48px] ${
                isSelected
                  ? 'bg-indigo-50/70 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 text-indigo-950 dark:text-indigo-100 shadow-sm ring-1 ring-indigo-600 dark:ring-indigo-500'
                  : 'bg-slate-50/50 dark:bg-slate-800/60 hover:bg-slate-100/70 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <span
                  className={`w-7 h-7 rounded-xl font-mono text-xs font-bold flex items-center justify-center transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 group-hover:border-indigo-300 dark:group-hover:border-indigo-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                  }`}
                >
                  {letter}
                </span>
                <span className="leading-relaxed">{option}</span>
              </div>

              <div className="shrink-0">
                {isSelected ? (
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
