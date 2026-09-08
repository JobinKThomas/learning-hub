import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Play, Sparkles, Edit, ArrowRight } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

export default function PlaygroundCard({ playground, showTopic = true }) {
  const { isAdmin } = useAuth();

  const difficultyColors = {
    BEGINNER: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    INTERMEDIATE: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    ADVANCED: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  };

  const diffColor = difficultyColors[playground.difficulty] || difficultyColors.BEGINNER;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/80 transition flex flex-col justify-between group">
      <div className="space-y-3">
        {/* Badges bar */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${diffColor}`}
            >
              {playground.difficulty || 'BEGINNER'}
            </span>

            <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
              <Terminal className="w-2.5 h-2.5 text-indigo-500 dark:text-indigo-400" />
              {playground.language || 'javascript'}
            </span>
          </div>

          {isAdmin && (
            <Link
              to={`/admin/playgrounds/${playground.id}/edit`}
              className="opacity-0 group-hover:opacity-100 transition text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 p-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"
              title="Edit Playground (Admin)"
            >
              <Edit className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Title & Description */}
        <div>
          <Link to={`/playgrounds/${playground.slug}`}>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition text-base line-clamp-1">
              {playground.title}
            </h3>
          </Link>
          {playground.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {playground.description}
            </p>
          )}
        </div>

        {/* Topic Reference if enabled */}
        {showTopic && playground.topic && (
          <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-medium">
            <span>Topic:</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold font-mono">
              {playground.topic.title}
            </span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center text-[11px] text-slate-400 dark:text-slate-500 gap-1">
          {playground.expectedOutput ? (
            <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
              <Sparkles className="w-3 h-3" />
              Interactive Challenge
            </span>
          ) : (
            <span>Code Sandbox</span>
          )}
        </div>

        <Link
          to={`/playgrounds/${playground.slug}`}
          className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition gap-1.5"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Launch</span>
        </Link>
      </div>
    </div>
  );
}
