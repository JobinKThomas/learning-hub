import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTopicBySlug, clearCurrentTopic } from '../features/topics/topicSlice';
import { fetchNotesByTopic } from '../features/notes/noteSlice';
import { fetchResourcesByTopic } from '../features/resources/resourceSlice';
import { fetchPlaygroundsByTopic } from '../features/playgrounds/playgroundSlice';
import NoteCard from '../features/notes/components/NoteCard';
import ResourceCard from '../features/resources/components/ResourceCard';
import PlaygroundCard from '../features/playgrounds/components/PlaygroundCard';
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
  Copy,
  Terminal,
  Plus,
  ExternalLink,
  Globe,
  Play,
} from 'lucide-react';

export default function TopicDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentTopic: topic, detailsLoading: loading, error } = useSelector(
    (state) => state.topics
  );
  const { notes, loading: notesLoading } = useSelector((state) => state.notes);
  const { resources, loading: resourcesLoading } = useSelector((state) => state.resources);
  const { topicPlaygrounds: playgrounds, loading: playgroundsLoading } = useSelector(
    (state) => state.playgrounds
  );
  const { isAdmin } = useAuth();

  const [completedKeyPoints, setCompletedKeyPoints] = useState({});
  const [copiedCodeIdx, setCopiedCodeIdx] = useState(null);
  const [copiedShare, setCopiedShare] = useState(false);
  const [resourceTypeFilter, setResourceTypeFilter] = useState('ALL');

  useEffect(() => {
    if (slug) {
      dispatch(fetchTopicBySlug(slug));
      dispatch(fetchNotesByTopic(slug));
      dispatch(fetchResourcesByTopic({ topicId: slug }));
      dispatch(fetchPlaygroundsByTopic(slug));
    }
    return () => {
      dispatch(clearCurrentTopic());
    };
  }, [dispatch, slug]);

  const toggleKeyPoint = (idx) => {
    setCompletedKeyPoints((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleCopyCode = (code, idx) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="h-6 bg-slate-200 rounded w-48 animate-pulse" />
        <div className="h-48 bg-slate-200 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Topic Not Found</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          {error || `The topic '/topics/${slug}' could not be located.`}
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

  const keyPoints = topic.keyPoints || [];
  const codeExamples = topic.codeExamples || [];
  const completedCount = Object.values(completedKeyPoints).filter(Boolean).length;
  const totalPoints = keyPoints.length;
  const progressPercent = totalPoints > 0 ? Math.round((completedCount / totalPoints) * 100) : 0;

  const parentSection = topic.section;
  const grandParentModule = parentSection?.module;
  const greatGrandParentPath = grandParentModule?.learningPath;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 4-Tier Hierarchy Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500">
          {greatGrandParentPath && (
            <>
              <Link
                to={`/learning-paths/${greatGrandParentPath.slug}`}
                className="hover:text-indigo-600 transition"
              >
                {greatGrandParentPath.title}
              </Link>
              <span>/</span>
            </>
          )}
          {grandParentModule && (
            <>
              <Link
                to={`/modules/${grandParentModule.slug}`}
                className="hover:text-indigo-600 transition"
              >
                {grandParentModule.title}
              </Link>
              <span>/</span>
            </>
          )}
          {parentSection ? (
            <Link
              to={`/sections/${parentSection.slug}`}
              className="inline-flex items-center text-indigo-600 font-bold hover:text-indigo-800 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              {parentSection.title}
            </Link>
          ) : (
            <Link to="/learning-paths" className="hover:text-indigo-600 transition">
              Curriculum
            </Link>
          )}
        </nav>

        {isAdmin && (
          <Link
            to={`/admin/topics/${topic.id}/edit`}
            className="inline-flex items-center px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold transition"
          >
            <Edit className="w-3.5 h-3.5 mr-1.5" />
            Edit Topic (Admin)
          </Link>
        )}
      </div>

      {/* Topic Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            Topic {topic.order || 1}
          </span>
          {parentSection && (
            <Link
              to={`/sections/${parentSection.slug}`}
              className="text-xs font-medium px-3 py-1 rounded-full bg-white/10 text-slate-200 border border-white/20 hover:bg-white/20 transition flex items-center gap-1.5"
            >
              <Layers className="w-3 h-3 text-indigo-300" />
              <span>Section: {parentSection.title}</span>
            </Link>
          )}
          {grandParentModule && (
            <Link
              to={`/modules/${grandParentModule.slug}`}
              className="text-xs font-medium px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10 hover:bg-white/15 transition"
            >
              {grandParentModule.title}
            </Link>
          )}
          {!topic.published && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
              Draft / Unpublished
            </span>
          )}
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono">
            {topic.title}
          </h1>
          {topic.summary && (
            <p className="text-indigo-300 text-sm sm:text-base font-medium">
              {topic.summary}
            </p>
          )}
        </div>

        <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
          {topic.description}
        </p>

        <div className="flex flex-wrap items-center gap-6 pt-3 text-xs sm:text-sm text-slate-300 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>
              Estimated Duration: <strong className="text-white">{topic.duration}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span>
              Code Examples: <strong className="text-white">{codeExamples.length} Snippets</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Examples & Content + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Code Examples, Notes & Key Points */}
        <div className="lg:col-span-2 space-y-6">
          {/* Code Examples Section */}
          {codeExamples.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Interactive Code Examples
                </h2>
              </div>

              {codeExamples.map((ex, exIdx) => (
                <div
                  key={exIdx}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden"
                >
                  <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <span className="text-xs font-bold text-slate-700 pl-2">
                        {ex.title || `Example ${exIdx + 1}`}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyCode(ex.code, exIdx)}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-200/70 transition gap-1"
                    >
                      {copiedCodeIdx === exIdx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="p-5 bg-slate-950 text-emerald-400 text-xs font-mono overflow-x-auto leading-relaxed">
                    <code>{ex.code}</code>
                  </pre>

                  {ex.explanation && (
                    <div className="p-4 bg-slate-50/80 border-t border-slate-100 text-xs text-slate-600 flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{ex.explanation}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Interactive Playgrounds Section: Topic -> Playground -> Code Editor -> Run -> Output */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Interactive Playgrounds & Challenges ({playgrounds?.length || 0})
                </h2>
              </div>

              {isAdmin && (
                <Link
                  to={`/admin/playgrounds/create?topic=${topic.slug}`}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition gap-1 border border-indigo-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Playground</span>
                </Link>
              )}
            </div>

            {playgroundsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-36 bg-slate-100 rounded-2xl animate-pulse" />
                <div className="h-36 bg-slate-100 rounded-2xl animate-pulse" />
              </div>
            ) : playgrounds && playgrounds.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {playgrounds.map((pg) => (
                  <PlaygroundCard key={pg.id} playground={pg} showTopic={false} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm text-center space-y-3">
                <Terminal className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">
                  No interactive playgrounds configured for this topic yet.
                </p>
                {isAdmin && (
                  <Link
                    to={`/admin/playgrounds/create?topic=${topic.slug}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Create First Playground
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Key Points / Concept Checklist */}
          {keyPoints.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-600" />
                  <h2 className="text-base font-bold text-slate-900">
                    Key Mechanics Checklist
                  </h2>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {completedCount} / {totalPoints} understood
                </span>
              </div>

              <div className="space-y-2.5">
                {keyPoints.map((point, idx) => {
                  const isChecked = !!completedKeyPoints[idx];
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleKeyPoint(idx)}
                      className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                        isChecked
                          ? 'bg-emerald-50/70 border-emerald-200 text-slate-900'
                          : 'bg-slate-50/50 hover:bg-slate-100/70 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-400 hover:text-indigo-600" />
                        )}
                      </div>
                      <span className={`text-xs ${isChecked ? 'line-through text-slate-500 font-medium' : 'font-semibold text-slate-800'}`}>
                        {point}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Lesson Guide / Content */}
          {topic.content ? (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Detailed Explanation & Best Practices
                </h2>
              </div>
              <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                {topic.content}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3 text-center py-10">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">
                Detailed notes for this topic will be available soon.
              </p>
            </div>
          )}

          {/* Notes Section: Topic -> Notes -> Select Note -> Read Note */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Study Notes & In-Depth Guides ({notes?.length || 0})
                </h2>
              </div>

              {isAdmin && (
                <Link
                  to={`/admin/notes/create?topic=${topic.slug}`}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition gap-1 border border-indigo-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Note</span>
                </Link>
              )}
            </div>

            {notesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-36 bg-slate-100 rounded-2xl animate-pulse" />
                <div className="h-36 bg-slate-100 rounded-2xl animate-pulse" />
              </div>
            ) : notes && notes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {notes.map((note) => (
                  <NoteCard key={note.id} note={note} showTopic={false} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm text-center space-y-3">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">
                  No notes published for this topic yet.
                </p>
                {isAdmin && (
                  <Link
                    to={`/admin/notes/create?topic=${topic.slug}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Create First Note
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Resources Section: Topic -> Resources (📚 Documentation, 🎥 Video, 🔗 Article, 💻 GitHub) */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Curated Learning Resources ({resources?.length || 0})
                </h2>
              </div>

              {isAdmin && (
                <Link
                  to={`/admin/resources/create?topic=${topic.slug}`}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition gap-1 border border-indigo-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Resource</span>
                </Link>
              )}
            </div>

            {/* Type Filters */}
            {resources && resources.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { key: 'ALL', label: 'All Resources' },
                  { key: 'DOCUMENTATION', label: '📚 Documentation' },
                  { key: 'VIDEO', label: '🎥 Video' },
                  { key: 'ARTICLE', label: '🔗 Article' },
                  { key: 'GITHUB', label: '💻 GitHub' },
                  { key: 'TOOL', label: '🛠️ Tool' },
                ].map((tab) => {
                  const isActive = resourceTypeFilter === tab.key;
                  const countForType =
                    tab.key === 'ALL'
                      ? resources.length
                      : resources.filter((r) => r.type === tab.key).length;

                  if (tab.key !== 'ALL' && countForType === 0) return null;

                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setResourceTypeFilter(tab.key)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-200/80 text-slate-700'
                        }`}
                      >
                        {countForType}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Resources List */}
            {resourcesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
                <div className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
              </div>
            ) : resources && resources.length > 0 ? (
              (() => {
                const filteredResources =
                  resourceTypeFilter === 'ALL'
                    ? resources
                    : resources.filter((r) => r.type === resourceTypeFilter);

                if (filteredResources.length === 0) {
                  return (
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                      No resources found for this category.
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredResources.map((res) => (
                      <ResourceCard key={res.id} resource={res} />
                    ))}
                  </div>
                );
              })()
            ) : (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm text-center space-y-3">
                <Globe className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">
                  No curated resources attached to this topic yet.
                </p>
                {isAdmin && (
                  <Link
                    to={`/admin/resources/create?topic=${topic.slug}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Attach First Resource
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Mastery & Quick Navigation */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-6 sticky top-24">
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                Topic Mastery
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                {topic.title} Overview
              </h3>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600">Key Points Mastered</span>
                <span className="text-indigo-600">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Status card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
              <span className="font-semibold text-slate-800">
                {progressPercent === 100
                  ? '🎉 Topic Concept Understood!'
                  : `${totalPoints - completedCount} key points remaining`}
              </span>
              <p className="text-[11px] text-slate-500">
                {progressPercent === 100
                  ? 'You have checked off all key points for this topic.'
                  : 'Check off each key point as you test the code snippets.'}
              </p>
            </div>

            {/* Direct Playground CTA */}
            {playgrounds && playgrounds.length > 0 && (
              <Link
                to={`/playgrounds/${playgrounds[0].slug}`}
                className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold shadow-lg shadow-slate-900/20 transition gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
                <span>Launch Interactive Playground</span>
              </Link>
            )}

            {/* Navigation back to parent section */}
            {parentSection && (
              <Link
                to={`/sections/${parentSection.slug}`}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition"
              >
                <span>Back to {parentSection.title} Section</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            )}

            {/* Share action */}
            <button
              onClick={handleShare}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center justify-center gap-2"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Share Topic</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
