import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';

export default function ModuleCard({ module, index }) {
  if (!module) return null;

  const orderNum = module.order ?? (index !== undefined ? index + 1 : 1);
  const topics = module.topics || [];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shadow-sm">
              {orderNum}
            </div>
            <div>
              <span className="inline-flex items-center text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Module {orderNum}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                {module.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 px-2 py-0.5 rounded-lg whitespace-nowrap">
            <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            <span>{module.duration || '2 hours'}</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {module.description}
        </p>

        {/* Topics Pills Preview */}
        {topics.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
              <span>Lessons & Topics ({topics.length}):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {topics.slice(0, 3).map((topic, tIdx) => (
                <span
                  key={tIdx}
                  className="px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/70 text-[11px] text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700 font-medium truncate max-w-[200px]"
                >
                  {topic}
                </span>
              ))}
              {topics.length > 3 && (
                <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                  +{topics.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 pt-0 border-t border-slate-50 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/40">
        <Link
          to={`/modules/${module.slug}`}
          className="w-full inline-flex items-center justify-between px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-600 text-slate-700 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-indigo-300 text-xs font-semibold transition shadow-xs group/btn"
        >
          <span>Explore Module Lessons</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 group-hover/btn:text-indigo-600 dark:group-hover/btn:text-indigo-400 group-hover/btn:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
