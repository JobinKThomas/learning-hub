import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

export default function TopicProgressBadge({ isCompleted = false, percentage = 0 }) {
  if (isCompleted || percentage === 100) {
    return (
      <span
        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full"
        title="Topic Completed"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" />
        <span>Done</span>
      </span>
    );
  }

  if (percentage > 0) {
    return (
      <span
        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-full"
        title={`${percentage}% completed`}
      >
        <span>{percentage}%</span>
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full"
      title="Not started"
    >
      <Circle className="w-3 h-3 text-slate-400 dark:text-slate-500" />
      <span>Todo</span>
    </span>
  );
}
