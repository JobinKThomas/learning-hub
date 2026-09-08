import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  Tag,
  Flame,
  Zap,
  Sparkles,
  Bookmark,
  Layers,
  Edit2,
  Trash2,
} from 'lucide-react';

export const getDifficultyMeta = (difficulty) => {
  switch (difficulty?.toUpperCase()) {
    case 'BEGINNER':
      return {
        label: 'Beginner',
        badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      };
    case 'INTERMEDIATE':
      return {
        label: 'Intermediate',
        badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      };
    case 'ADVANCED':
      return {
        label: 'Advanced',
        badgeClass: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      };
    default:
      return {
        label: 'All Levels',
        badgeClass: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      };
  }
};

export const getFrequencyMeta = (frequency) => {
  switch (frequency?.toUpperCase()) {
    case 'FREQUENT':
      return {
        label: 'Frequently Asked',
        badgeClass: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        Icon: Flame,
      };
    case 'COMMON':
      return {
        label: 'Common Question',
        badgeClass: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        Icon: Zap,
      };
    case 'RARE':
      return {
        label: 'Specialized / Edge Case',
        badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
        Icon: Sparkles,
      };
    default:
      return {
        label: 'Standard',
        badgeClass: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        Icon: Bookmark,
      };
  }
};

export default function InterviewQuestionCard({
  question,
  index,
  showAdminActions = false,
  onEdit,
  onDelete,
}) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!question) return null;

  const difficultyMeta = getDifficultyMeta(question.difficulty);
  const frequencyMeta = getFrequencyMeta(question.frequency);
  const FrequencyIcon = frequencyMeta.Icon;

  const handleCopy = () => {
    if (!question.codeSnippet) return;
    navigator.clipboard.writeText(question.codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const topicTitle = question.topic?.title || 'General Topic';
  const lineage = question.lineage;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-indigo-300/80 dark:hover:border-indigo-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header Bar */}
      <div className="p-5 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Topic & Lineage */}
            {lineage?.module && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/60">
                <Layers className="w-3 h-3" />
                {lineage.module.title} › {topicTitle}
              </span>
            )}
            {!lineage?.module && question.topic && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/60">
                {topicTitle}
              </span>
            )}

            {/* Difficulty Badge */}
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${difficultyMeta.badgeClass}`}
            >
              {difficultyMeta.label}
            </span>

            {/* Frequency Badge */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${frequencyMeta.badgeClass}`}
            >
              <FrequencyIcon className="w-3 h-3" />
              {frequencyMeta.label}
            </span>
          </div>

          {/* Admin Controls if requested */}
          {showAdminActions && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit?.(question)}
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                title="Edit Question"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete?.(question)}
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
                title="Delete Question"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Question Prompt */}
        <div className="flex items-start gap-3">
          {index !== undefined && (
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center mt-0.5">
              {index}
            </span>
          )}
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
            {question.question}
          </h3>
        </div>

        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pl-9">
            {question.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded"
              >
                <Tag className="w-2.5 h-2.5 text-slate-400 dark:text-slate-500" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer & Reveal Button */}
      <div className="px-4 sm:px-5 py-3 bg-slate-50/60 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <button
          onClick={() => setIsRevealed(!isRevealed)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition duration-150 min-h-[40px] ${
            isRevealed
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 dark:shadow-none'
          }`}
        >
          {isRevealed ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Hide Answer</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Reveal Answer</span>
            </>
          )}
        </button>

        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          {isRevealed ? 'Model Answer & Explanation' : 'Self-test before viewing'}
        </span>
      </div>

      {/* Revealable Answer Panel */}
      {isRevealed && (
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-indigo-50/20 dark:bg-indigo-950/20 space-y-4 animate-in fade-in duration-200">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 mb-2">
              Model Answer:
            </h4>
            <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              {question.answer}
            </div>
          </div>

          {/* Optional Code Snippet */}
          {question.codeSnippet && (
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-200">
              <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900 text-xs font-mono text-slate-400 border-b border-slate-800">
                <span>Code Example</span>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-[11px]"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-sans">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="font-sans">Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 text-xs font-mono overflow-x-auto leading-normal text-emerald-300">
                <code>{question.codeSnippet}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
