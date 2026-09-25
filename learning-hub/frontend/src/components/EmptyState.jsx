import React from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Plus } from 'lucide-react';

/**
 * Reusable EmptyState Component
 * 
 * Provides consistent empty state illustration, title, description,
 * and call-to-action button across all data lists, grids, and tabs.
 */
export default function EmptyState({
  title = 'No items found',
  description = 'There are no items to display at this time.',
  icon: Icon = FolderOpen,
  actionText,
  actionLink,
  onAction,
  actionIcon: ActionIcon = Plus,
  secondaryActionText,
  secondaryActionLink,
  onSecondaryAction,
  className = '',
}) {
  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-3xl p-10 sm:p-12 text-center border border-dashed border-slate-300 dark:border-slate-800 shadow-xs max-w-md mx-auto space-y-5 ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center shadow-inner">
        <Icon className="w-8 h-8" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
          {description}
        </p>
      </div>

      {(actionText || secondaryActionText) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
          {actionText && actionLink && (
            <Link
              to={actionLink}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-200 dark:shadow-none transition gap-1.5"
            >
              <ActionIcon className="w-3.5 h-3.5" />
              <span>{actionText}</span>
            </Link>
          )}

          {actionText && onAction && !actionLink && (
            <button
              onClick={onAction}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-200 dark:shadow-none transition gap-1.5"
            >
              <ActionIcon className="w-3.5 h-3.5" />
              <span>{actionText}</span>
            </button>
          )}

          {secondaryActionText && secondaryActionLink && (
            <Link
              to={secondaryActionLink}
              className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
            >
              <span>{secondaryActionText}</span>
            </Link>
          )}

          {secondaryActionText && onSecondaryAction && !secondaryActionLink && (
            <button
              onClick={onSecondaryAction}
              className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
            >
              <span>{secondaryActionText}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
