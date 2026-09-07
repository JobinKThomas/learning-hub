import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchModuleBySlug, clearCurrentModule } from '../features/modules/moduleSlice';
import { useAuth } from '../hooks/useAuth';
import {
  ArrowLeft,
  Clock,
  BookOpen,
  CheckCircle2,
  Circle,
  Sparkles,
  Layers,
  Edit,
  Share2,
  Check,
  AlertCircle,
  GraduationCap,
  Target,
  ArrowRight,
} from 'lucide-react';

export default function ModuleDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentModule: module, detailsLoading: loading, error } = useSelector(
    (state) => state.modules
  );
  const { isAdmin } = useAuth();

  const [completedTopics, setCompletedTopics] = useState({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (slug) {
      dispatch(fetchModuleBySlug(slug));
    }
    return () => {
      dispatch(clearCurrentModule());
    };
  }, [dispatch, slug]);

  const toggleTopic = (index) => {
    setCompletedTopics((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="h-6 bg-slate-200 rounded w-48 animate-pulse" />
        <div className="h-44 bg-slate-200 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Module Not Found</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          {error || `The module '/modules/${slug}' could not be located.`}
        </p>
        <div>
          <Link
            to="/learning-paths"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Learning Paths
          </Link>
        </div>
      </div>
    );
  }

  const topics = module.topics || [];
  const objectives = module.learningObjectives || [];
  const totalTopics = topics.length;
  const completedCount = Object.values(completedTopics).filter(Boolean).length;
  const progressPercent = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
  const parentPath = module.learningPath;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
          {parentPath ? (
            <Link
              to={`/learning-paths/${parentPath.slug}`}
              className="inline-flex items-center hover:text-indigo-600 transition"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to {parentPath.title}
            </Link>
          ) : (
            <Link
              to="/learning-paths"
              className="inline-flex items-center hover:text-indigo-600 transition"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Learning Paths
            </Link>
          )}
        </div>

        {isAdmin && (
          <Link
            to={`/admin/modules/${module.id}/edit`}
            className="inline-flex items-center px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold transition"
          >
            <Edit className="w-3.5 h-3.5 mr-1.5" />
            Edit Module (Admin)
          </Link>
        )}
      </div>

      {/* Module Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            Module {module.order || 1}
          </span>
          {parentPath && (
            <Link
              to={`/learning-paths/${parentPath.slug}`}
              className="text-xs font-medium px-3 py-1 rounded-full bg-white/10 text-slate-200 border border-white/20 hover:bg-white/20 transition"
            >
              {parentPath.title}
            </Link>
          )}
          {!module.published && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
              Draft / Unpublished
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          {module.title}
        </h1>

        <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          {module.description}
        </p>

        <div className="flex flex-wrap items-center gap-6 pt-3 text-xs sm:text-sm text-slate-300 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>
              Estimated Duration: <strong className="text-white">{module.duration}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>
              Total Lessons: <strong className="text-white">{totalTopics} Topics</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Lessons + Progress Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Learning Objectives & Topics Checklist */}
        <div className="lg:col-span-2 space-y-6">
          {/* Learning Objectives */}
          {objectives.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                Key Learning Objectives
              </h2>
              <ul className="space-y-2.5">
                {objectives.map((obj, oIdx) => (
                  <li key={oIdx} className="flex items-start gap-3 text-xs text-slate-700">
                    <div className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-2.5 h-2.5" />
                    </div>
                    <span className="leading-relaxed">{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Topics / Lessons Checklist */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  Module Curriculum & Lessons
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Check off lessons as you complete exercises and master the concepts.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {completedCount} / {totalTopics} completed
              </span>
            </div>

            <div className="space-y-3">
              {topics.map((topic, idx) => {
                const isCompleted = !!completedTopics[idx];
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleTopic(idx)}
                    className={`w-full p-4 rounded-xl border text-left flex items-start gap-4 transition-all ${
                      isCompleted
                        ? 'bg-emerald-50/60 border-emerald-200 text-slate-900'
                        : 'bg-slate-50/50 hover:bg-slate-100/70 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400 hover:text-indigo-600" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          Lesson {idx + 1}: {topic}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {isCompleted ? 'Completed' : 'To Do'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Progress & Actions Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-6 sticky top-24">
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                Progress Tracker
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Module Completion
              </h3>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600">Completion Rate</span>
                <span className="text-indigo-600">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Completion status feedback */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
              <span className="font-semibold text-slate-800">
                {progressPercent === 100
                  ? '🎉 Module Complete!'
                  : `${totalTopics - completedCount} lessons remaining`}
              </span>
              <p className="text-[11px] text-slate-500">
                {progressPercent === 100
                  ? 'Great job! You have completed all lessons in this module.'
                  : 'Click on each topic card to mark it as completed as you study.'}
              </p>
            </div>

            {/* Return to parent path action */}
            {parentPath && (
              <Link
                to={`/learning-paths/${parentPath.slug}`}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition"
              >
                <span>Continue {parentPath.title} Track</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            )}

            {/* Share action */}
            <button
              onClick={handleShare}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Share Module</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
