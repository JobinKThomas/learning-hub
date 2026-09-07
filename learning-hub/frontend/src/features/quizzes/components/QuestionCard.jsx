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
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
      {/* Question Header */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 border-b border-slate-100 pb-3">
        <span className="uppercase tracking-wider text-indigo-600 font-bold">
          Question {currentIndex + 1} of {totalQuestions}
        </span>
        <span className="text-slate-400">Multiple Choice</span>
      </div>

      {/* Question Text */}
      <div className="space-y-3">
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
          {question.question}
        </h2>

        {/* Optional Code Snippet */}
        {question.codeSnippet && (
          <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-2xl overflow-x-auto leading-relaxed border border-slate-800">
            <code>{question.codeSnippet}</code>
          </pre>
        )}
      </div>

      {/* Options List */}
      <div className="space-y-3 pt-2">
        {question.options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          const letter = OPTION_LETTERS[idx] || `${idx + 1}`;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectOption(idx)}
              className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-4 group ${
                isSelected
                  ? 'bg-indigo-50/70 border-indigo-600 text-indigo-950 shadow-sm ring-1 ring-indigo-600'
                  : 'bg-slate-50/50 hover:bg-slate-100/70 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <span
                  className={`w-7 h-7 rounded-xl font-mono text-xs font-bold flex items-center justify-center transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-500 group-hover:border-indigo-300 group-hover:text-indigo-600'
                  }`}
                >
                  {letter}
                </span>
                <span className="leading-relaxed">{option}</span>
              </div>

              <div className="shrink-0">
                {isSelected ? (
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 group-hover:text-slate-400" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
