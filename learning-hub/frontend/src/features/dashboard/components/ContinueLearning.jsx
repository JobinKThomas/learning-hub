import React from 'react';
import { Link } from 'react-router-dom';
import ProgressBar from '../../progress/components/ProgressBar';
import {
  PlayCircle,
  ArrowRight,
  BookOpen,
  Layers,
  Sparkles,
  Compass,
} from 'lucide-react';

export default function ContinueLearning({ item }) {
  if (!item || !item.topic) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Compass className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Continue Learning</h3>
          </div>
          <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />
          <p className="text-xs text-slate-500 dark:text-slate-400 pt-2">
            You have not started any learning paths yet. Explore our curriculum to begin your journey.
          </p>
        </div>
        <Link
          to="/learning-paths"
          className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 dark:shadow-none transition gap-2 min-h-[44px]"
        >
          <span>Explore Learning Paths</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const { learningPath, module, section, topic, progress = 0, continueUrl, isNew } = item;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-5 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Header Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <PlayCircle className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Continue Learning</h3>
          </div>
          {isNew ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Recommended Start
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              In Progress
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

        {/* Hierarchy Lineage as requested:
            JavaScript
            Functions
            Closures
        */}
        <div className="space-y-1.5 py-1">
          {learningPath?.title && (
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {learningPath.title}
            </div>
          )}
          {module?.title && (
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>{module.title}</span>
            </div>
          )}
          {topic?.title && (
            <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {topic.title}
            </div>
          )}
        </div>

        {/* Progress: 65% */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-600 dark:text-slate-400">Progress</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">{progress}%</span>
          </div>
          <ProgressBar percentage={progress} size="md" variant="auto" showLabel={false} />
        </div>
      </div>

      {/* [Continue] Action Button */}
      <div className="pt-2">
        <Link
          to={continueUrl || `/topics/${topic.slug}`}
          className="w-full inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-xs font-bold shadow-md shadow-indigo-200 dark:shadow-none transition gap-2 group min-h-[44px]"
        >
          <span>{isNew ? 'Start Topic' : 'Continue'}</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
