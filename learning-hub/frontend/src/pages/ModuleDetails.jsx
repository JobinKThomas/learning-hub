import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchModuleBySlug, clearCurrentModule } from '../features/modules/moduleSlice';
import { fetchSectionsByModule } from '../features/sections/sectionSlice';
import { fetchModuleProgress } from '../features/progress/progressSlice';
import ProgressBar from '../features/progress/components/ProgressBar';
import TopicProgressBadge from '../features/progress/components/TopicProgressBadge';
import { useAuth } from '../hooks/useAuth';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { normalizeList } from '../utils/normalize';
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
  PlusCircle,
} from 'lucide-react';

export default function ModuleDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentModule: module, detailsLoading: loading, error } = useSelector(
    (state) => state.modules
  );
  const { sections: rawSections, loading: sectionsLoading, error: sectionsError } = useSelector(
    (state) => state.sections
  );
  const { currentModuleProgress } = useSelector(
    (state) => state.progress
  );
  const { isAdmin } = useAuth();

  const [completedTopics, setCompletedTopics] = useState({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (slug) {
      dispatch(fetchModuleBySlug(slug));
      dispatch(fetchSectionsByModule(slug));
      dispatch(fetchModuleProgress(slug));
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LoadingState variant="detail" count={3} />
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <ErrorState
          statusCode={404}
          title="Module Not Found"
          message={error || `The module '/modules/${slug}' could not be located.`}
          actionText="Back to Learning Paths"
          actionLink="/learning-paths"
          onRetry={() => dispatch(fetchModuleBySlug(slug))}
        />
      </div>
    );
  }

  const sections = normalizeList(rawSections);
  const topics = normalizeList(module.topics);
  const objectives = normalizeList(module.learningObjectives);
  const totalTopics = currentModuleProgress?.totalTopics ?? topics.length;
  const completedCount = currentModuleProgress?.completedTopics ?? Object.values(completedTopics).filter(Boolean).length;
  const progressPercent = currentModuleProgress?.percentage ?? (totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0);
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

          {/* Curriculum Sections & Sub-lessons (Phase 5) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Module Sections & Lessons
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Deep-dive sections covering essential concepts and syntax breakdown.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">
                  {sections.length} {sections.length === 1 ? 'Section' : 'Sections'}
                </span>
                {isAdmin && (
                  <Link
                    to={`/admin/sections/create?module=${module.slug}`}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-[11px] font-semibold transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5 mr-1" />
                    + Add Section
                  </Link>
                )}
              </div>
            </div>

            {sectionsError ? (
              <ErrorState
                title="Unable to load sections."
                message="Please try again."
                onRetry={() => dispatch(fetchSectionsByModule(slug))}
                variant="card"
              />
            ) : sectionsLoading ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Loading module sections...
              </div>
            ) : sections.length === 0 ? (
              <EmptyState
                icon={Layers}
                title="No sections found"
                description="No specific sections created for this module yet."
                actionText={isAdmin ? "Create First Section" : undefined}
                actionLink={isAdmin ? `/admin/sections/create?module=${module.slug}` : undefined}
              />
            ) : (
              <div className="space-y-4">
                {sections.map((section, sIdx) => {
                  const sectionProg = currentModuleProgress?.sections?.find(
                    (s) => String(s.id) === String(section.id || section._id) || s.slug === section.slug
                  );
                  return (
                    <div
                      key={section.id}
                      className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-all group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-grow">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                              Section {section.order || sIdx + 1}
                            </span>
                            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-500" />
                              {section.duration}
                            </span>
                            {sectionProg && (
                              <TopicProgressBadge
                                isCompleted={sectionProg.percentage === 100}
                                percentage={sectionProg.percentage}
                                size="xs"
                              />
                            )}
                          </div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                          <Link to={`/sections/${section.slug}`}>
                            {section.title}
                          </Link>
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {section.description}
                        </p>

                        {/* Sub-lesson items pills (e.g. var, let, const) */}
                        {section.items && section.items.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-2">
                            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                              Topics:
                            </span>
                            {section.items.map((item, itemIdx) => (
                              <span
                                key={itemIdx}
                                className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px] font-medium"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 self-start sm:self-center">
                        <Link
                          to={`/sections/${section.slug}`}
                          className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-semibold text-xs transition gap-1"
                        >
                          <span>Study Section</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>

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
            <ProgressBar
              percentage={progressPercent}
              label="Completion Rate"
              variant="indigo"
              size="md"
            />

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
