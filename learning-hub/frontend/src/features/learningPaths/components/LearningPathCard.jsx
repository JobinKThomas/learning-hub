import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Code,
  FileCode,
  Layers,
  Server,
  Terminal,
  BookOpen,
  Cpu,
  Clock,
  BookMarked,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const ICON_MAP = {
  Code: Code,
  FileCode: FileCode,
  Layers: Layers,
  Server: Server,
  Terminal: Terminal,
  BookOpen: BookOpen,
  Cpu: Cpu,
};

const COLOR_MAP = {
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-800',
    accent: 'bg-amber-500',
    iconBg: 'bg-amber-500/10 text-amber-600',
  },
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-700',
    badge: 'bg-indigo-100 text-indigo-800',
    accent: 'bg-indigo-500',
    iconBg: 'bg-indigo-500/10 text-indigo-600',
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-800',
    accent: 'bg-emerald-500',
    iconBg: 'bg-emerald-500/10 text-emerald-600',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-800',
    accent: 'bg-purple-500',
    iconBg: 'bg-purple-500/10 text-purple-600',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-800',
    accent: 'bg-blue-500',
    iconBg: 'bg-blue-500/10 text-blue-600',
  },
};

const LEVEL_COLORS = {
  Beginner: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Intermediate: 'bg-blue-50 text-blue-700 border-blue-200',
  Advanced: 'bg-purple-50 text-purple-700 border-purple-200',
};

export default function LearningPathCard({ path, progress }) {
  if (!path) return null;

  const [showAllModules, setShowAllModules] = useState(false);

  const IconComponent = ICON_MAP[path.icon] || Code;
  const colorTheme = COLOR_MAP[path.color] || COLOR_MAP.indigo;
  const levelStyle = LEVEL_COLORS[path.level] || LEVEL_COLORS.Beginner;
  const progressVal = progress ?? path.progress;

  const modules = Array.isArray(path.modules) ? path.modules : [];
  const totalModulesCount = path.modulesCount ?? modules.length;
  const totalTopicsCount =
    path.totalTopics ??
    modules.reduce(
      (acc, m) => acc + (m.topicsCount || (m.topics ? m.topics.length : 0)),
      0
    );

  const displayedModules = showAllModules ? modules : modules.slice(0, 2);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      {/* Card Header & Content */}
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-bold shrink-0 ${colorTheme.iconBg}`}>
            <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex flex-wrap items-center gap-1.5 justify-end">
            <span
              className={`text-[10px] sm:text-[11px] font-semibold px-2 sm:px-2.5 py-0.5 rounded-full border ${levelStyle}`}
            >
              {path.level}
            </span>
            <span className="text-[10px] sm:text-[11px] font-medium px-2 sm:px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {path.category}
            </span>
          </div>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 mb-2">
          {path.title}
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 sm:mb-5 leading-relaxed">
          {path.description}
        </p>

        {/* Path Metrics */}
        <div className="grid grid-cols-3 gap-1 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center text-slate-500 dark:text-slate-400 font-medium mb-0.5 text-[10px] sm:text-xs">
              <BookMarked className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 text-slate-400 shrink-0" />
              <span>Modules</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
              {totalModulesCount}
            </span>
          </div>

          <div className="flex flex-col items-center text-center border-x border-slate-200 dark:border-slate-800">
            <div className="flex items-center text-slate-500 dark:text-slate-400 font-medium mb-0.5 text-[10px] sm:text-xs">
              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 text-slate-400 shrink-0" />
              <span>Topics</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
              {totalTopicsCount}
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="flex items-center text-slate-500 dark:text-slate-400 font-medium mb-0.5 text-[10px] sm:text-xs">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 text-slate-400 shrink-0" />
              <span>Duration</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
              {path.estimatedHours}h
            </span>
          </div>
        </div>

        {/* Modules & Topics Breakdown */}
        {modules.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Modules & Key Topics</span>
              </span>
              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-800/60">
                {modules.length} Modules • {totalTopicsCount} Topics
              </span>
            </div>

            {/* List of Modules & their Topics */}
            <div className="space-y-2">
              {displayedModules.map((mod, idx) => {
                const modTopics = Array.isArray(mod.topics) ? mod.topics : [];
                return (
                  <div
                    key={mod.id || mod._id || idx}
                    className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/70 text-xs space-y-1.5 transition-colors hover:border-indigo-200 dark:hover:border-indigo-800/60"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {mod.order ?? idx + 1}
                        </span>
                        <Link
                          to={`/modules/${mod.slug}`}
                          className="font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 truncate text-[11px] sm:text-xs transition-colors"
                          title={mod.title}
                        >
                          {mod.title}
                        </Link>
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 shrink-0">
                        {mod.duration}
                      </span>
                    </div>

                    {/* Topic Pills */}
                    {modTopics.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pl-7">
                        {modTopics.slice(0, 3).map((topic, tIdx) => {
                          const topicTitle = typeof topic === 'object' ? topic.title : topic;
                          return (
                            <span
                              key={tIdx}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800 font-medium truncate max-w-[170px]"
                              title={topicTitle}
                            >
                              {topicTitle}
                            </span>
                          );
                        })}
                        {modTopics.length > 3 && (
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                            +{modTopics.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* View all modules & topics toggle button */}
            {modules.length > 2 && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowAllModules((prev) => !prev);
                }}
                className="w-full text-center text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 py-1 transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>
                  {showAllModules
                    ? 'Show fewer modules'
                    : `View all ${modules.length} modules & ${totalTopicsCount} topics`}
                </span>
                {showAllModules ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Card Footer / Action Button */}
      <div className="p-5 sm:p-6 pt-0">
        {typeof progressVal === 'number' && (
          <div className="mb-3 space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <span>Path Progress</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">{progressVal}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${progressVal}%` }}
              />
            </div>
          </div>
        )}
        <Link
          to={`/learning-paths/${path.slug}`}
          className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-indigo-600 dark:hover:bg-indigo-600 text-white font-semibold text-xs sm:text-sm transition-all duration-200 shadow-sm group-hover:shadow group-hover:shadow-indigo-200 dark:group-hover:shadow-none min-h-[44px]"
        >
          <span>Explore Curriculum</span>
          <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
