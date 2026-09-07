import React from 'react';
import ProgressBar from '../../progress/components/ProgressBar';
import {
  Sparkles,
  Compass,
  CheckCircle2,
  Award,
  BookOpen,
  Play,
  TrendingUp,
} from 'lucide-react';

export default function DashboardCards({ user, stats }) {
  const overallProgress = stats?.overallProgress ?? 0;
  const learningPathsCount = stats?.learningPathsCount ?? 0;
  const completedTopicsCount = stats?.completedTopicsCount ?? 0;
  const quizAverage = stats?.quizAverage ?? 0;
  const totalNotes = stats?.totalNotesCompleted ?? 0;
  const totalPlaygrounds = stats?.totalPlaygroundsCompleted ?? 0;

  return (
    <div className="space-y-6">
      {/* Primary Highlight Card as requested:
          ┌──────────────────────────────────────┐
          │ Welcome back!                        │
          │                                      │
          │ Overall Progress          67%        │
          │ Learning Paths             3         │
          │ Completed Topics          24         │
          │ Quiz Average              82%        │
          └──────────────────────────────────────┘
      */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <TrendingUp className="w-80 h-80 text-indigo-400" />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Personal Learning Analytics</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back{user?.name ? `, ${user.name}` : ''}!
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs text-slate-400">Target Curriculum</div>
                <div className="text-sm font-bold text-white">Full Stack Engineer</div>
              </div>
            </div>
          </div>

          {/* Core 4-metric grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Overall Progress */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Overall Progress
                </span>
                <span className="text-emerald-400 font-bold text-sm">
                  {overallProgress}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Weighted mastery across all curriculum paths
              </p>
            </div>

            {/* 2. Learning Paths */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-indigo-400" />
                  Learning Paths
                </span>
                <div className="text-2xl font-extrabold text-white">
                  {learningPathsCount}
                </div>
                <p className="text-[11px] text-slate-400">Active learning tracks</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 flex items-center justify-center font-bold">
                {learningPathsCount}
              </div>
            </div>

            {/* 3. Completed Topics */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Completed Topics
                </span>
                <div className="text-2xl font-extrabold text-white">
                  {completedTopicsCount}
                </div>
                <p className="text-[11px] text-slate-400">Lessons fully mastered</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 flex items-center justify-center font-bold">
                {completedTopicsCount}
              </div>
            </div>

            {/* 4. Quiz Average */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  Quiz Average
                </span>
                <div className="text-2xl font-extrabold text-amber-300">
                  {quizAverage}%
                </div>
                <p className="text-[11px] text-slate-400">
                  {quizAverage >= 70 ? 'Passing benchmark' : 'In evaluation'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
                {quizAverage}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Notes Read
            </div>
            <div className="text-lg font-bold text-slate-900">{totalNotes}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Play className="w-5 h-5 fill-current text-amber-500" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Playgrounds
            </div>
            <div className="text-lg font-bold text-slate-900">{totalPlaygrounds}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Quiz Attempts
            </div>
            <div className="text-lg font-bold text-slate-900">
              {stats?.totalQuizAttempts ?? 0}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Accuracy Rate
            </div>
            <div className="text-lg font-bold text-slate-900">{quizAverage}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
