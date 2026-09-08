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
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    case 'INTERMEDIATE':
      return {
        label: 'Intermediate',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      };
    case 'ADVANCED':
      return {
        label: 'Advanced',
        badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
      };
    default:
      return {
        label: 'All Levels',
        badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
      };
  }
};

export const getFrequencyMeta = (frequency) => {
  switch (frequency?.toUpperCase()) {
    case 'FREQUENT':
      return {
        label: 'Frequently Asked',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        Icon: Flame,
      };
    case 'COMMON':
      return {
        label: 'Common Question',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
        Icon: Zap,
      };
    case 'RARE':
      return {
        label: 'Specialized / Edge Case',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
        Icon: Sparkles,
      };
    default:
      return {
        label: 'Standard',
        badgeClass: 'bg-slate-50 text-slate-600 border-slate-200',
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
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header Bar */}
      <div className="p-5 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Topic & Lineage */}
            {lineage?.module && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                <Layers className="w-3 h-3" />
                {lineage.module.title} › {topicTitle}
              </span>
            )}
            {!lineage?.module && question.topic && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
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
                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                title="Edit Question"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete?.(question)}
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
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
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center mt-0.5">
              {index}
            </span>
          )}
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {question.question}
          </h3>
        </div>

        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pl-9">
            {question.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded"
              >
                <Tag className="w-2.5 h-2.5 text-slate-400" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer & Reveal Button */}
      <div className="px-4 sm:px-5 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={() => setIsRevealed(!isRevealed)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition duration-150 min-h-[40px] ${
            isRevealed
              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200'
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

        <span className="text-xs text-slate-400 font-medium">
          {isRevealed ? 'Model Answer & Explanation' : 'Self-test before viewing'}
        </span>
      </div>

      {/* Revealable Answer Panel */}
      {isRevealed && (
        <div className="p-5 border-t border-slate-200 bg-indigo-50/20 space-y-4 animate-in fade-in duration-200">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-2">
              Model Answer:
            </h4>
            <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
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
