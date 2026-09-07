import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSectionBySlug, clearCurrentSection } from '../features/sections/sectionSlice';
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
  Code2,
  FileText,
} from 'lucide-react';

export default function SectionDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentSection: section, detailsLoading: loading, error } = useSelector(
    (state) => state.sections
  );
  const { isAdmin } = useAuth();

  const [completedItems, setCompletedItems] = useState({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (slug) {
      dispatch(fetchSectionBySlug(slug));
    }
    return () => {
      dispatch(clearCurrentSection());
    };
  }, [dispatch, slug]);

  const toggleItem = (itemKey) => {
    setCompletedItems((prev) => ({
      ...prev,
      [itemKey]: !prev[itemKey],
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

  if (error || !section) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Section Not Found</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          {error || `The section '/sections/${slug}' could not be located.`}
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

  const items = section.items || [];
  const totalItems = items.length;
  const completedCount = Object.values(completedItems).filter(Boolean).length;
  const progressPercent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
  const parentModule = section.module;
  const grandParentPath = parentModule?.learningPath;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
          {parentModule ? (
            <Link
              to={`/modules/${parentModule.slug}`}
              className="inline-flex items-center hover:text-indigo-600 transition"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to {parentModule.title}
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
            to={`/admin/sections/${section.id}/edit`}
            className="inline-flex items-center px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold transition"
          >
            <Edit className="w-3.5 h-3.5 mr-1.5" />
            Edit Section (Admin)
          </Link>
        )}
      </div>

      {/* Section Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            Section {section.order || 1}
          </span>
          {parentModule && (
            <Link
              to={`/modules/${parentModule.slug}`}
              className="text-xs font-medium px-3 py-1 rounded-full bg-white/10 text-slate-200 border border-white/20 hover:bg-white/20 transition flex items-center gap-1.5"
            >
              <Layers className="w-3 h-3 text-indigo-300" />
              <span>Module: {parentModule.title}</span>
            </Link>
          )}
          {grandParentPath && (
            <Link
              to={`/learning-paths/${grandParentPath.slug}`}
              className="text-xs font-medium px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10 hover:bg-white/15 transition"
            >
              {grandParentPath.title}
            </Link>
          )}
          {!section.published && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
              Draft / Unpublished
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          {section.title}
        </h1>

        <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          {section.description}
        </p>

        <div className="flex flex-wrap items-center gap-6 pt-3 text-xs sm:text-sm text-slate-300 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>
              Estimated Duration: <strong className="text-white">{section.duration}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span>
              Sub-lessons & Topics: <strong className="text-white">{totalItems} Concepts</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Content + Checklist Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Topics Breakdown & Detailed Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sub-lessons Interactive Checklist */}
          {items.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                    Concepts & Sub-lessons
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click each item to check it off as you master each concept.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {completedCount} / {totalItems} mastered
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map((item, idx) => {
                  const isCompleted = !!completedItems[item];
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleItem(item)}
                      className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isCompleted
                          ? 'bg-emerald-50/70 border-emerald-200 text-slate-900'
                          : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-400 hover:text-indigo-600" />
                          )}
                        </div>
                        <span className={`font-mono text-sm font-bold ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {item}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isCompleted ? 'Mastered' : 'To Learn'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section Deep-Dive Content / Guide */}
          {section.content ? (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Lesson Notes & Code Reference
                </h2>
              </div>
              <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                {section.content}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3 text-center py-10">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">
                Detailed study notes for this section will be available soon.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Progress & Quick Navigation */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-6 sticky top-24">
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                Lesson Progress
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Section Mastery
              </h3>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600">Completion</span>
                <span className="text-indigo-600">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Completion status feedback */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
              <span className="font-semibold text-slate-800">
                {progressPercent === 100
                  ? '🎉 Section Mastered!'
                  : `${totalItems - completedCount} concepts remaining`}
              </span>
              <p className="text-[11px] text-slate-500">
                {progressPercent === 100
                  ? 'All sub-lessons in this section have been marked as mastered.'
                  : 'Check off each concept card as you write code and test it.'}
              </p>
            </div>

            {/* Return to parent module action */}
            {parentModule && (
              <Link
                to={`/modules/${parentModule.slug}`}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition"
              >
                <span>Back to {parentModule.title}</span>
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
                  <span>Share Section</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
