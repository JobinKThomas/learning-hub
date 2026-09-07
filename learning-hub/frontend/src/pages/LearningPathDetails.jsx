import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLearningPathBySlug, clearCurrentPath } from '../features/learningPaths/learningPathSlice';
import { fetchModulesByLearningPath } from '../features/modules/moduleSlice';
import { useAuth } from '../hooks/useAuth';
import {
  ArrowLeft,
  Clock,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  Edit,
  Share2,
  Check,
  AlertCircle,
  GraduationCap,
  Award,
  PlusCircle,
  ArrowRight,
} from 'lucide-react';

const LEVEL_BADGES = {
  Beginner: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Intermediate: 'bg-blue-100 text-blue-800 border-blue-300',
  Advanced: 'bg-purple-100 text-purple-800 border-purple-300',
};

export default function LearningPathDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentPath: path, detailsLoading: loading, error } = useSelector(
    (state) => state.learningPaths
  );
  const { modules: standaloneModules } = useSelector((state) => state.modules);
  const { isAdmin } = useAuth();

  const [expandedModules, setExpandedModules] = useState({});
  const [enrolled, setEnrolled] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (slug) {
      dispatch(fetchLearningPathBySlug(slug));
      dispatch(fetchModulesByLearningPath(slug));
    }
    return () => {
      dispatch(clearCurrentPath());
    };
  }, [dispatch, slug]);

  // Expand first 2 modules by default once loaded
  useEffect(() => {
    if (path?.modules) {
      const initial = {};
      path.modules.forEach((_, idx) => {
        initial[idx] = true; // all open by default
      });
      setExpandedModules(initial);
    }
  }, [path]);

  const toggleModule = (index) => {
    setExpandedModules((prev) => ({
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
        <div className="h-48 bg-slate-200 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !path) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Learning Path Not Found</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          {error || `The path '/learning-paths/${slug}' could not be located. It may have been unpublished or removed.`}
        </p>
        <div>
          <Link
            to="/learning-paths"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Paths
          </Link>
        </div>
      </div>
    );
  }

  const levelBadge = LEVEL_BADGES[path.level] || LEVEL_BADGES.Beginner;

  const displayModules =
    standaloneModules && standaloneModules.length > 0
      ? standaloneModules
      : path.modules || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/learning-paths"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Learning Paths
        </Link>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <Link
              to={`/admin/modules/create?path=${path.id}`}
              className="inline-flex items-center px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold transition"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
              Add Module
            </Link>
            <Link
              to={`/admin/learning-paths/${path.id}/edit`}
              className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition"
            >
              <Edit className="w-3.5 h-3.5 mr-1.5" />
              Edit Path
            </Link>
          </div>
        )}
      </div>

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${levelBadge}`}
            >
              {path.level}
            </span>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-white/10 text-slate-200 border border-white/20">
              {path.category}
            </span>
            {!path.published && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                Draft / Unpublished
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {path.title}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            {path.description}
          </p>

          {/* Key Metrics row */}
          <div className="flex flex-wrap items-center gap-6 pt-4 text-xs sm:text-sm text-slate-300 border-t border-white/10">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>
                <strong className="text-white font-bold">{displayModules.length}</strong>{' '}
                Modules
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                <strong className="text-white font-bold">{path.totalTopics || 0}</strong> Key
                Topics
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>
                <strong className="text-white font-bold">{path.estimatedHours}</strong> Total Hours
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Curriculum + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Curriculum Modules */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              Curriculum Roadmap
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">
                {displayModules.length} sequential modules
              </span>
              {isAdmin && (
                <Link
                  to={`/admin/modules/create?path=${path.id}`}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-semibold transition"
                >
                  <PlusCircle className="w-3.5 h-3.5 mr-1" />
                  Add Module
                </Link>
              )}
            </div>
          </div>

          {displayModules && displayModules.length > 0 ? (
            <div className="space-y-4">
              {displayModules.map((module, idx) => {
                const isOpen = !!expandedModules[idx];
                const moduleSlug = module.slug || `module-${idx + 1}`;
                return (
                  <div
                    key={module._id || module.id || idx}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all"
                  >
                    {/* Module Accordion Header */}
                    <div className="p-5 flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-grow cursor-pointer" onClick={() => toggleModule(idx)}>
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                          {module.order ?? idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                              {module.title}
                            </h3>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                              <Clock className="w-3 h-3 mr-1 text-slate-400" />
                              {module.duration}
                            </span>
                          </div>
                          {module.description && (
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                              {module.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pl-4">
                        <Link
                          to={`/modules/${moduleSlug}`}
                          className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition whitespace-nowrap"
                        >
                          <span>Open Module</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Link>
                        <button
                          onClick={() => toggleModule(idx)}
                          className="text-slate-400 hover:text-slate-600 p-1"
                          title={isOpen ? 'Collapse' : 'Expand'}
                        >
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Topics Checklist (Collapsible) */}
                    {isOpen && module.topics && module.topics.length > 0 && (
                      <div className="px-5 pb-5 pt-1 border-t border-slate-100 bg-slate-50/50">
                        <div className="text-xs font-semibold text-slate-500 mb-2.5">
                          Lessons & Practice:
                        </div>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {module.topics.map((topic, tIdx) => (
                            <li
                              key={tIdx}
                              className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-100 text-xs text-slate-700"
                            >
                              <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                                <Check className="w-2.5 h-2.5" />
                              </div>
                              <span className="font-medium truncate">{topic}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-3 pt-3 border-t border-slate-100 sm:hidden">
                          <Link
                            to={`/modules/${moduleSlug}`}
                            className="w-full inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold shadow-sm"
                          >
                            <span>Open Module Lessons</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
              <p className="text-sm text-slate-500">
                No modules specified for this curriculum yet.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Enrollment & Actions Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-6 sticky top-24">
            <div>
              <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Enrollment
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                Begin This Path
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enroll to track your milestone progress, complete hands-on exercises, and earn your certification.
              </p>
            </div>

            {/* Action Button */}
            <div>
              <button
                onClick={() => setEnrolled(!enrolled)}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                  enrolled
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                }`}
              >
                {enrolled ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Enrolled (In Progress)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Enroll Now (Free)</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Specs */}
            <div className="border-t border-slate-100 pt-4 space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Pace:</span>
                <span className="font-semibold text-slate-800">Self-paced</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Skill Level:</span>
                <span className="font-semibold text-slate-800">{path.level}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Estimated Effort:</span>
                <span className="font-semibold text-slate-800">{path.estimatedHours} hours total</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Certification:</span>
                <span className="font-semibold text-slate-800">Included upon completion</span>
              </div>
            </div>

            {/* Share / Copy link */}
            <div className="border-t border-slate-100 pt-4">
              <button
                onClick={handleShare}
                className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Share Curriculum</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
