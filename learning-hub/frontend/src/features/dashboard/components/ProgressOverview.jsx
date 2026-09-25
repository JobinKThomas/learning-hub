import React from 'react';
import { Link } from 'react-router-dom';
import ProgressBar from '../../progress/components/ProgressBar';
import {
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Clock,
  BookOpen,
  Layers,
} from 'lucide-react';

export default function ProgressOverview({ learningPaths = [] }) {
  if (!learningPaths || learningPaths.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-3">
        <GraduationCap className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">No Tracks Found</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Curriculum learning paths will appear here once loaded.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Curriculum Tracks & Mastery
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Your real-time progress across structured curricula
          </p>
        </div>
        <Link
          to="/learning-paths"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition self-start sm:self-auto flex items-center gap-1"
        >
          <span>All Tracks</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-4">
        {learningPaths.map((lp) => {
          const isCompleted = lp.percentage === 100;
          const isInProgress = lp.percentage > 0 && !isCompleted;

          return (
            <div
              key={lp.id || lp.slug}
              className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-white dark:hover:bg-slate-800/60 hover:border-indigo-200 dark:hover:border-indigo-800/80 hover:shadow-sm transition-all space-y-3 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      <Link to={`/learning-paths/${lp.slug}`}>{lp.title}</Link>
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {lp.level || 'Beginner'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span>{lp.category}</span>
                    <span>•</span>
                    <span>
                      {lp.completedTopics} of {lp.totalTopics} topics completed
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      isCompleted
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : isInProgress
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isCompleted
                      ? 'Mastered'
                      : isInProgress
                      ? `${lp.percentage}% In Progress`
                      : 'Not Started'}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <ProgressBar
                  percentage={lp.percentage}
                  size="sm"
                  variant={isCompleted ? 'emerald' : 'indigo'}
                  showLabel={false}
                />
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  {lp.totalTopics - lp.completedTopics > 0
                    ? `${lp.totalTopics - lp.completedTopics} topics remaining`
                    : 'Track completed 🎉'}
                </span>
                <Link
                  to={`/learning-paths/${lp.slug}`}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                >
                  <span>{isInProgress ? 'Resume Path' : 'View Path'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
