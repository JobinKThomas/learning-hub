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
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-600">
            <Compass className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900">Continue Learning</h3>
          </div>
          <div className="h-px bg-slate-100 w-full" />
          <p className="text-xs text-slate-500 pt-2">
            You have not started any learning paths yet. Explore our curriculum to begin your journey.
          </p>
        </div>
        <Link
          to="/learning-paths"
          className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition gap-2 min-h-[44px]"
        >
          <span>Explore Learning Paths</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const { learningPath, module, section, topic, progress = 0, continueUrl, isNew } = item;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-5 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Header Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <PlayCircle className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Continue Learning</h3>
          </div>
          {isNew ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Recommended Start
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
              In Progress
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 w-full" />

        {/* Hierarchy Lineage as requested:
            JavaScript
            Functions
            Closures
        */}
        <div className="space-y-1.5 py-1">
          {learningPath?.title && (
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              {learningPath.title}
            </div>
          )}
          {module?.title && (
            <div className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>{module.title}</span>
            </div>
          )}
          {topic?.title && (
            <div className="text-xl font-extrabold text-slate-900 tracking-tight">
              {topic.title}
            </div>
          )}
        </div>

        {/* Progress: 65% */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-600">Progress</span>
            <span className="text-indigo-600 font-bold">{progress}%</span>
          </div>
          <ProgressBar percentage={progress} size="md" variant="auto" showLabel={false} />
        </div>
      </div>

      {/* [Continue] Action Button */}
      <div className="pt-2">
        <Link
          to={continueUrl || `/topics/${topic.slug}`}
          className="w-full inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-xs font-bold shadow-md shadow-indigo-200 transition gap-2 group min-h-[44px]"
        >
          <span>{isNew ? 'Start Topic' : 'Continue'}</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
