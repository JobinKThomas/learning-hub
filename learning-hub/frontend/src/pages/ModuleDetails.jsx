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
import TopicContentReader from '../components/TopicContentReader';
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
  ChevronDown,
  ChevronUp,
  Search,
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
  const [showAllObjectives, setShowAllObjectives] = useState(false);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [curriculumFilter, setCurriculumFilter] = useState('ALL');
  const [curriculumSearch, setCurriculumSearch] = useState('');

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

  const filteredTopics = topics
    .map((topic, originalIndex) => ({ topic, originalIndex }))
    .filter(({ topic, originalIndex }) => {
      const isCompleted = !!completedTopics[originalIndex];
      if (curriculumFilter === 'TODO' && isCompleted) return false;
      if (curriculumFilter === 'COMPLETED' && !isCompleted) return false;
      if (curriculumSearch.trim()) {
        return topic.toLowerCase().includes(curriculumSearch.trim().toLowerCase());
      }
      return true;
    });

  const displayedTopics = showAllTopics ? filteredTopics : filteredTopics.slice(0, 8);
  const hasMoreTopics = !showAllTopics && filteredTopics.length > 8;

  const displayedObjectives = showAllObjectives ? objectives : objectives.slice(0, 6);
  const hasMoreObjectives = !showAllObjectives && objectives.length > 6;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
          {parentPath ? (
            <Link
              to={`/learning-paths/${parentPath.slug}`}
              className="inline-flex items-center hover:text-indigo-600 transition min-h-[36px]"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Back to {parentPath.title}</span>
            </Link>
          ) : (
            <Link
              to="/learning-paths"
              className="inline-flex items-center hover:text-indigo-600 transition min-h-[36px]"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Back to Learning Paths</span>
            </Link>
          )}
        </div>

        {isAdmin && (
          <Link
            to={`/admin/modules/${module.id}/edit`}
            className="inline-flex items-center px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold transition min-h-[36px]"
          >
            <Edit className="w-3.5 h-3.5 mr-1.5" />
            <span>Edit Module (Admin)</span>
          </Link>
        )}
      </div>

      {/* Module Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white shadow-xl space-y-3 sm:space-y-4">
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

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
          {module.title}
        </h1>

        <p className="text-slate-300 text-xs sm:text-sm md:text-base max-w-3xl leading-relaxed">
          {module.description}
        </p>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-3 text-xs sm:text-sm text-slate-300 border-t border-white/10">
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
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center">
                    <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                    Key Learning Objectives
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                    {objectives.length} Objectives
                  </span>
                  {objectives.length > 6 && (
                    <button
                      type="button"
                      onClick={() => setShowAllObjectives((prev) => !prev)}
                      className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 inline-flex items-center gap-1 transition"
                    >
                      <span>{showAllObjectives ? 'Collapse' : 'Expand'}</span>
                      {showAllObjectives ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* 2-column responsive grid of compact objective cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {displayedObjectives.map((obj, oIdx) => (
                  <div
                    key={oIdx}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-700 dark:text-slate-300 hover:border-indigo-200 dark:hover:border-indigo-800/70 transition-all shadow-2xs"
                  >
                    <div className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-2.5 h-2.5" />
                    </div>
                    <span className="leading-snug font-medium line-clamp-2">{obj}</span>
                  </div>
                ))}
              </div>

              {/* Show more / Show less expander button */}
              {hasMoreObjectives && (
                <button
                  type="button"
                  onClick={() => setShowAllObjectives(true)}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center justify-center gap-1.5 bg-slate-50/30 dark:bg-slate-950/20"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Show all {objectives.length} objectives (+{objectives.length - 6} more)</span>
                </button>
              )}
              {showAllObjectives && objectives.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowAllObjectives(false)}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center justify-center gap-1.5 bg-slate-50/30 dark:bg-slate-950/20"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Show less</span>
                </button>
              )}
            </div>
          )}

          {/* Module Deep-Dive Content / Guide if present */}
          {module.content && (
            <TopicContentReader
              content={module.content}
              title="Module Study Guide & Overview"
            />
          )}

          {/* Curriculum Sections & Sub-lessons (Phase 5) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Module Sections & Lessons
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Deep-dive sections covering essential concepts and syntax breakdown.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {sections.length} {sections.length === 1 ? 'Section' : 'Sections'}
                </span>
                {isAdmin && (
                  <Link
                    to={`/admin/sections/create?module=${module.slug}`}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 text-[11px] font-semibold transition"
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
                      className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 hover:bg-white dark:hover:bg-slate-800/60 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-sm transition-all group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-grow">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300">
                              Section {section.order || sIdx + 1}
                            </span>
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
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
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                          <Link to={`/sections/${section.slug}`}>
                            {section.title}
                          </Link>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {section.description}
                        </p>

                        {/* Sub-lesson items pills (e.g. var, let, const) */}
                        {section.items && section.items.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-2">
                            <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider">
                              Topics:
                            </span>
                            {section.items.map((item, itemIdx) => (
                              <span
                                key={itemIdx}
                                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-medium"
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
                          className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white font-semibold text-xs transition gap-1"
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
          {topics.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              {/* Header with Title and Progress */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                      Module Curriculum & Lessons
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Check off lessons as you complete exercises and master the concepts.
                    </p>
                  </div>
                </div>

                {/* Progress Mini Bar & Count */}
                <div className="flex items-center gap-3 self-end sm:self-center bg-slate-50 dark:bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                  <div className="w-20 sm:w-28 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300"
                      style={{
                        width: `${totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {completedCount} / {totalTopics}
                  </span>
                </div>
              </div>

              {/* Filter Tabs & Search Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                {/* Status Filter Tabs */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setCurriculumFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      curriculumFilter === 'ALL'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    All ({topics.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurriculumFilter('TODO')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      curriculumFilter === 'TODO'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    To Do ({Math.max(0, topics.length - completedCount)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurriculumFilter('COMPLETED')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      curriculumFilter === 'COMPLETED'
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    Completed ({completedCount})
                  </button>
                </div>

                {/* Quick Search if more than 6 topics */}
                {topics.length > 6 && (
                  <div className="relative flex-grow sm:flex-grow-0 sm:w-48">
                    <input
                      type="text"
                      value={curriculumSearch}
                      onChange={(e) => setCurriculumSearch(e.target.value)}
                      placeholder="Filter lessons..."
                      className="w-full pl-8 pr-3 py-1 rounded-xl text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                )}
              </div>

              {/* 2-Column Responsive Grid of Compact Lesson Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {displayedTopics.map(({ topic, originalIndex }) => {
                  const isCompleted = !!completedTopics[originalIndex];
                  return (
                    <button
                      key={originalIndex}
                      type="button"
                      onClick={() => toggleTopic(originalIndex)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-all ${
                        isCompleted
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/50 text-slate-900 dark:text-slate-100'
                          : 'bg-slate-50/40 dark:bg-slate-950/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-grow">
                        <div className="shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400" />
                          )}
                        </div>
                        <div className="truncate">
                          <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 mr-1.5">
                            L{originalIndex + 1}
                          </span>
                          <span
                            className={`text-xs font-semibold ${
                              isCompleted
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {topic}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50'
                        }`}
                      >
                        {isCompleted ? 'Done' : 'To Do'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Show more button if truncated */}
              {hasMoreTopics && (
                <button
                  type="button"
                  onClick={() => setShowAllTopics(true)}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center justify-center gap-1.5 bg-slate-50/40 dark:bg-slate-950/30"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Show all {filteredTopics.length} lessons (+{filteredTopics.length - 8} more)</span>
                </button>
              )}
              {showAllTopics && filteredTopics.length > 8 && (
                <button
                  type="button"
                  onClick={() => setShowAllTopics(false)}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center justify-center gap-1.5 bg-slate-50/40 dark:bg-slate-950/30"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Show less</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Progress & Actions Card */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6 sticky top-24">
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                Progress Tracker
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
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
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {progressPercent === 100
                  ? '🎉 Module Complete!'
                  : `${totalTopics - completedCount} lessons remaining`}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {progressPercent === 100
                  ? 'Great job! You have completed all lessons in this module.'
                  : 'Click on each topic card to mark it as completed as you study.'}
              </p>
            </div>

            {/* Return to parent path action */}
            {parentPath && (
              <Link
                to={`/learning-paths/${parentPath.slug}`}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 dark:shadow-none transition"
              >
                <span>Continue {parentPath.title} Track</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            )}

            {/* Share action */}
            <button
              onClick={handleShare}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
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
