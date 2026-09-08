import React from 'react';

/**
 * Reusable LoadingState Component
 * 
 * Provides skeleton placeholders and spinner variations
 * with consistent Tailwind styling and smooth pulse animations.
 */
export default function LoadingState({
  variant = 'cards', // 'cards' | 'rows' | 'spinner' | 'table' | 'detail'
  count = 3,
  message = 'Loading content...',
  className = '',
}) {
  if (variant === 'spinner') {
    return (
      <div
        className={`min-h-[40vh] flex flex-col items-center justify-center space-y-3 ${className}`}
      >
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-slate-200 dark:border-slate-800 border-t-indigo-600 dark:border-t-indigo-400" />
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
          {message}
        </span>
      </div>
    );
  }

  if (variant === 'rows') {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs animate-pulse flex items-center justify-between gap-4"
          >
            <div className="space-y-2.5 flex-grow">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-2/3" />
            </div>
            <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden ${className}`}>
        <div className="h-12 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 animate-pulse" />
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {Array.from({ length: count }).map((_, idx) => (
            <div key={idx} className="p-4 flex items-center gap-4 animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
              <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-1/3" />
              <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-1/6 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'detail') {
    return (
      <div className={`max-w-5xl mx-auto space-y-6 ${className}`}>
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-48 animate-pulse" />
        <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: count }).map((_, idx) => (
              <div key={idx} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Default: cards grid
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 h-64 animate-pulse flex flex-col justify-between"
        >
          <div className="space-y-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
            <div className="space-y-2">
              <div className="h-3.5 bg-slate-100 dark:bg-slate-800/60 rounded w-full" />
              <div className="h-3.5 bg-slate-100 dark:bg-slate-800/60 rounded w-5/6" />
            </div>
          </div>
          <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
        </div>
      ))}
    </div>
  );
}
