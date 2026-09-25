import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTopicBySlug, clearCurrentTopic } from '../features/topics/topicSlice';
import { fetchNotesByTopic } from '../features/notes/noteSlice';
import { fetchResourcesByTopic } from '../features/resources/resourceSlice';
import { fetchPlaygroundsByTopic } from '../features/playgrounds/playgroundSlice';
import { fetchQuizzesByTopic } from '../features/quizzes/quizSlice';
import { fetchInterviewQuestionsByTopic } from '../features/interviewQuestions/interviewQuestionSlice';
import {
  updateProgress,
  fetchTopicProgress,
} from '../features/progress/progressSlice';
import NoteCard from '../features/notes/components/NoteCard';
import ResourceCard from '../features/resources/components/ResourceCard';
import PlaygroundCard from '../features/playgrounds/components/PlaygroundCard';
import QuizCard from '../features/quizzes/components/QuizCard';
import InterviewQuestionCard from '../features/interviewQuestions/components/InterviewQuestionCard';
import ProgressBar from '../features/progress/components/ProgressBar';
import CompleteButton from '../features/progress/components/CompleteButton';
import TopicCodePlayground from '../features/playgrounds/components/TopicCodePlayground';
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
  Code2,
  FileText,
  Copy,
  Terminal,
  Plus,
  ExternalLink,
  Globe,
  Play,
  HelpCircle,
  Award,
  Flame,
  RotateCcw,
} from 'lucide-react';

export default function TopicDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentTopic: topic, detailsLoading: loading, error } = useSelector(
    (state) => state.topics
  );
  const { notes: rawNotes, loading: notesLoading, error: notesError } = useSelector((state) => state.notes);
  const { resources: rawResources, loading: resourcesLoading, error: resourcesError } = useSelector((state) => state.resources);
  const { topicPlaygrounds: rawPlaygrounds, loading: playgroundsLoading, error: playgroundsError } = useSelector(
    (state) => state.playgrounds
  );
  const { topicQuizzes: rawQuizzes, loading: quizzesLoading, error: quizzesError } = useSelector(
    (state) => state.quizzes
  );
  const { questions: rawInterviewQuestions, loading: interviewQuestionsLoading, error: interviewQuestionsError } = useSelector(
    (state) => state.interviewQuestions
  );
  const { currentTopicProgress, actionLoading: progressLoading } = useSelector(
    (state) => state.progress
  );
  const { isAdmin } = useAuth();

  const [completedKeyPoints, setCompletedKeyPoints] = useState({});
  const [copiedCodeIdx, setCopiedCodeIdx] = useState(null);
  const [copiedShare, setCopiedShare] = useState(false);
  const [resourceTypeFilter, setResourceTypeFilter] = useState('ALL');
  const [activeHubTab, setActiveHubTab] = useState('checklist'); // 'checklist' | 'notes' | 'interview' | 'challenges' | 'resources'

  useEffect(() => {
    if (slug) {
      dispatch(fetchTopicBySlug(slug));
      dispatch(fetchNotesByTopic(slug));
      dispatch(fetchResourcesByTopic({ topicId: slug }));
      dispatch(fetchPlaygroundsByTopic(slug));
      dispatch(fetchQuizzesByTopic(slug));
      dispatch(fetchInterviewQuestionsByTopic({ topicId: slug }));
      dispatch(fetchTopicProgress(slug));
    }
    return () => {
      dispatch(clearCurrentTopic());
    };
  }, [dispatch, slug]);

  const isKeyPointChecked = (idx) => {
    if (currentTopicProgress?.completedKeyPoints) {
      return currentTopicProgress.completedKeyPoints.includes(idx);
    }
    return Boolean(completedKeyPoints[idx]);
  };

  const toggleKeyPoint = (idx) => {
    const isChecked = isKeyPointChecked(idx);
    setCompletedKeyPoints((prev) => ({
      ...prev,
      [idx]: !isChecked,
    }));
    dispatch(
      updateProgress({
        topicId: slug,
        keyPointIndex: idx,
        completed: !isChecked,
      })
    );
  };

  const handleToggleTopicComplete = () => {
    const isTopicCompleted = Boolean(currentTopicProgress?.isCompleted);
    dispatch(
      updateProgress({
        topicId: slug,
        isCompleted: !isTopicCompleted,
      })
    );
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LoadingState variant="detail" count={3} />
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <ErrorState
          statusCode={404}
          title="Topic Not Found"
          message={error || `The topic '/topics/${slug}' could not be located.`}
          actionText="Back to Learning Paths"
          actionLink="/learning-paths"
          onRetry={() => dispatch(fetchTopicBySlug(slug))}
        />
      </div>
    );
  }

  const notes = normalizeList(rawNotes);
  const resources = normalizeList(rawResources);
  const playgrounds = normalizeList(rawPlaygrounds);
  const quizzes = normalizeList(rawQuizzes);
  const interviewQuestions = normalizeList(rawInterviewQuestions);
  const keyPoints = normalizeList(topic.keyPoints);
  const codeExamples = normalizeList(topic.codeExamples);
  const completedCount = currentTopicProgress?.completedKeyPoints?.length ?? Object.values(completedKeyPoints).filter(Boolean).length;
  const totalPoints = keyPoints.length;
  const isTopicCompleted = Boolean(currentTopicProgress?.isCompleted);
  const progressPercent = currentTopicProgress?.completionPercentage ?? (isTopicCompleted ? 100 : (totalPoints > 0 ? Math.round((completedCount / totalPoints) * 100) : 0));

  const parentSection = topic.section;
  const grandParentModule = parentSection?.module;
  const greatGrandParentPath = grandParentModule?.learningPath;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
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

        <div className="flex items-center gap-2">
          <CompleteButton
            isCompleted={Boolean(currentTopicProgress?.isCompleted)}
            onToggle={handleToggleTopicComplete}
            loading={progressLoading}
            labelActive="Topic Completed"
            labelInactive="Mark Topic as Completed"
            size="sm"
          />

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
      </div>

      {/* Topic Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white shadow-xl space-y-3 sm:space-y-4">
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
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight font-mono">
            {topic.title}
          </h1>
          {topic.summary && (
            <p className="text-indigo-300 text-xs sm:text-sm md:text-base font-medium">
              {topic.summary}
            </p>
          )}
        </div>

        <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
          {topic.description}
        </p>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-3 text-xs sm:text-sm text-slate-300 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>
              Estimated Duration: <strong className="text-white">{topic.duration || 'N/A'}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span>
              Code Examples: <strong className="text-white">{codeExamples.length} Snippets</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>
              Key Mechanics: <strong className="text-white">{completedCount} / {totalPoints}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Topic Mastery (Left) & Playground / Reader / Hub (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Topic Mastery Sidebar */}
        <div className="lg:col-span-4 xl:col-span-4 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                Topic Mastery
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                {topic.title} Overview
              </h3>
            </div>

            {/* Progress Bar & Mark Complete */}
            <div className="space-y-3.5">
              <ProgressBar
                percentage={progressPercent}
                label="Topic Mastery"
                variant="auto"
                size="md"
              />

              <CompleteButton
                isCompleted={isTopicCompleted}
                onToggle={handleToggleTopicComplete}
                loading={progressLoading}
                labelActive="Topic Completed"
                labelInactive="Mark Topic as Completed"
                className="w-full justify-center"
              />
            </div>

            {/* Status card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 text-xs space-y-1">
              <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                {progressPercent === 100 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Topic Fully Mastered!</span>
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 text-indigo-500" />
                    <span>
                      {totalPoints > 0 ? `${totalPoints - completedCount} key points remaining` : 'In Progress'}
                    </span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {progressPercent === 100
                  ? 'Great job! You have conquered this topic guide.'
                  : 'Check off each key point, explore the code playground, and test your knowledge.'}
              </p>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 text-center">
                <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">Duration</div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{topic.duration || 'N/A'}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 text-center">
                <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">Snippets</div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{codeExamples.length} Examples</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 text-center">
                <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">Key Points</div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{completedCount}/{totalPoints} Done</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 text-center">
                <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">Study Notes</div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{notes.length} Guides</div>
              </div>
            </div>

            {/* Activities & Practice Links (Refined List Items) */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Activities & Practice
              </div>

              {/* Knowledge Quiz Link */}
              {quizzes && quizzes.length > 0 && (
                <Link
                  to={`/quizzes/${quizzes[0].slug || quizzes[0].id}`}
                  className="group flex items-center justify-between p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 hover:bg-purple-100/70 dark:hover:bg-purple-900/50 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-600/10 dark:bg-purple-400/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition">
                        Knowledge Quiz
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {quizzes[0].questions?.length || 0} questions
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-500 group-hover:translate-x-0.5 transition" />
                </Link>
              )}

              {/* Technical Interview Questions Quick Jump */}
              {interviewQuestions && interviewQuestions.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveHubTab('interview');
                    document.getElementById('practice-hub')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full group flex items-center justify-between p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 hover:bg-rose-100/70 dark:hover:bg-rose-900/50 transition text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-rose-600/10 dark:bg-rose-400/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-rose-600 dark:group-hover:text-rose-300 transition">
                        Interview Questions
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {interviewQuestions.length} interview prompts
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-rose-500 group-hover:translate-x-0.5 transition" />
                </button>
              )}

              {/* Standalone Playground Link */}
              {playgrounds && playgrounds.length > 0 && (
                <Link
                  to={`/playgrounds/${playgrounds[0].slug}`}
                  className="group flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/50 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600/10 dark:bg-emerald-400/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition">
                        Dedicated Sandbox
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Full-screen playground
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-500 group-hover:translate-x-0.5 transition" />
                </Link>
              )}
            </div>

            {/* Actions: Back & Share */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {parentSection && (
                <Link
                  to={`/sections/${parentSection.slug}`}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition gap-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to {parentSection.title}</span>
                </Link>
              )}

              <button
                type="button"
                onClick={handleShare}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-2"
              >
                {copiedShare ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Share Topic</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Code Playground, Detailed Explanation, Practice Hub */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-8">
          {/* 1. Interactive Code Playground */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Terminal className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Interactive Code Playground
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Runner
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline font-medium">
                Try running and editing code directly in-place
              </span>
            </div>

            <TopicCodePlayground topic={topic} codeExamples={codeExamples} />
          </div>

          {/* 2. Detailed Explanation (TopicContentReader with Step-by-Step Navigation) */}
          <div className="space-y-3">
            <TopicContentReader content={topic.content} />
          </div>

          {/* 3. Tabbed Practice & Resource Hub */}
          <div id="practice-hub" className="space-y-4 pt-2 scroll-mt-24">
            {/* Tab Navigation Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-1.5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-1">
              {[
                {
                  id: 'checklist',
                  label: 'Key Mechanics',
                  icon: Target,
                  count: totalPoints > 0 ? `${completedCount}/${totalPoints}` : null,
                },
                {
                  id: 'notes',
                  label: 'Study Notes',
                  icon: BookOpen,
                  count: notes.length,
                },
                {
                  id: 'interview',
                  label: 'Interview Prep',
                  icon: Flame,
                  count: interviewQuestions.length,
                },
                {
                  id: 'challenges',
                  label: 'Quizzes & Sandboxes',
                  icon: Award,
                  count: quizzes.length + playgrounds.length,
                },
                {
                  id: 'resources',
                  label: 'Resources',
                  icon: Globe,
                  count: resources.length,
                },
              ].map((tab) => {
                const isActive = activeHubTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveHubTab(tab.id)}
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                    {tab.count !== null && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Content Container */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm min-h-[300px]">
              {/* 3a. KEY MECHANICS CHECKLIST */}
              {activeHubTab === 'checklist' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        Key Mechanics Checklist
                      </h3>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {currentTopicProgress?.completedKeyPoints?.length ?? completedCount} / {totalPoints} understood
                    </span>
                  </div>

                  {keyPoints.length > 0 ? (
                    <div className="space-y-2.5">
                      {keyPoints.map((point, idx) => {
                        const isChecked = isKeyPointChecked(idx);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => toggleKeyPoint(idx)}
                            className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                              isChecked
                                ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-slate-900 dark:text-slate-100'
                                : 'bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {isChecked ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400" />
                              )}
                            </div>
                            <span
                              className={`text-xs ${
                                isChecked
                                  ? 'line-through text-slate-500 dark:text-slate-500 font-medium'
                                  : 'font-semibold text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {point}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Target}
                      title="No checklist items"
                      description="This topic does not define individual key points."
                    />
                  )}
                </div>
              )}

              {/* 3b. STUDY NOTES */}
              {activeHubTab === 'notes' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        Study Notes & In-Depth Guides ({notes?.length || 0})
                      </h3>
                    </div>
                    {isAdmin && (
                      <Link
                        to={`/admin/notes/create?topic=${topic.slug}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-semibold transition gap-1 border border-indigo-200 dark:border-indigo-800"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Note</span>
                      </Link>
                    )}
                  </div>

                  {notesError ? (
                    <ErrorState
                      title="Unable to load notes."
                      message="Please try again."
                      onRetry={() => dispatch(fetchNotesByTopic(slug))}
                      variant="card"
                    />
                  ) : notesLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="h-36 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                      <div className="h-36 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                    </div>
                  ) : notes && notes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {notes.map((note) => {
                        const isNoteCompleted = currentTopicProgress?.completedNotes?.some(
                          (id) => String(id) === String(note.id || note._id)
                        );
                        return (
                          <NoteCard
                            key={note.id}
                            note={note}
                            showTopic={false}
                            isCompleted={isNoteCompleted}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyState
                      icon={BookOpen}
                      title="No study notes found"
                      description="No notes published for this topic yet."
                      actionText={isAdmin ? "Create First Note" : undefined}
                      actionLink={isAdmin ? `/admin/notes/create?topic=${topic.slug}` : undefined}
                    />
                  )}
                </div>
              )}

              {/* 3c. INTERVIEW QUESTIONS */}
              {activeHubTab === 'interview' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        Technical Interview Questions ({interviewQuestions?.length || 0})
                      </h3>
                    </div>
                    {isAdmin && (
                      <Link
                        to={`/admin/interview-questions/create?topic=${topic.slug}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-semibold transition gap-1 border border-indigo-200 dark:border-indigo-800"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Question</span>
                      </Link>
                    )}
                  </div>

                  {interviewQuestionsError ? (
                    <ErrorState
                      title="Unable to load interview questions."
                      message="Please try again."
                      onRetry={() => dispatch(fetchInterviewQuestionsByTopic({ topicId: slug }))}
                      variant="card"
                    />
                  ) : interviewQuestionsLoading ? (
                    <div className="space-y-4">
                      <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                      <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                    </div>
                  ) : interviewQuestions && interviewQuestions.length > 0 ? (
                    <div className="space-y-4">
                      {interviewQuestions.map((q, idx) => (
                        <InterviewQuestionCard key={q.id} question={q} index={idx + 1} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Flame}
                      title="No interview questions found"
                      description="No technical interview questions added for this topic yet."
                      actionText={isAdmin ? "Create First Question" : undefined}
                      actionLink={isAdmin ? `/admin/interview-questions/create?topic=${topic.slug}` : undefined}
                    />
                  )}
                </div>
              )}

              {/* 3d. QUIZZES & PLAYGROUNDS */}
              {activeHubTab === 'challenges' && (
                <div className="space-y-8">
                  {/* Quizzes Sub-block */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                          Evaluation Quizzes ({quizzes?.length || 0})
                        </h3>
                      </div>
                      {isAdmin && (
                        <Link
                          to={`/admin/quizzes/create?topic=${topic.slug}`}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-semibold transition gap-1 border border-indigo-200 dark:border-indigo-800"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Quiz</span>
                        </Link>
                      )}
                    </div>

                    {quizzesError ? (
                      <ErrorState
                        title="Unable to load quizzes."
                        message="Please try again."
                        onRetry={() => dispatch(fetchQuizzesByTopic(slug))}
                        variant="card"
                      />
                    ) : quizzesLoading ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="h-36 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                        <div className="h-36 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                      </div>
                    ) : quizzes && quizzes.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {quizzes.map((quiz) => (
                          <QuizCard key={quiz.id} quiz={quiz} showTopic={false} />
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={HelpCircle}
                        title="No quizzes found"
                        description="No evaluation quizzes published for this topic yet."
                        actionText={isAdmin ? "Create First Quiz" : undefined}
                        actionLink={isAdmin ? `/admin/quizzes/create?topic=${topic.slug}` : undefined}
                      />
                    )}
                  </div>

                  {/* Standalone Playgrounds Sub-block */}
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                          Dedicated Coding Sandboxes ({playgrounds?.length || 0})
                        </h3>
                      </div>
                      {isAdmin && (
                        <Link
                          to={`/admin/playgrounds/create?topic=${topic.slug}`}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-indigo-900/50 text-xs font-semibold transition gap-1 border border-emerald-200 dark:border-emerald-800"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Sandbox</span>
                        </Link>
                      )}
                    </div>

                    {playgroundsError ? (
                      <ErrorState
                        title="Unable to load playgrounds."
                        message="Please try again."
                        onRetry={() => dispatch(fetchPlaygroundsByTopic(slug))}
                        variant="card"
                      />
                    ) : playgroundsLoading ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="h-36 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                        <div className="h-36 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                      </div>
                    ) : playgrounds && playgrounds.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {playgrounds.map((pg) => (
                          <PlaygroundCard key={pg.id} playground={pg} showTopic={false} />
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={Terminal}
                        title="No standalone playgrounds"
                        description="No dedicated standalone playgrounds configured for this topic."
                        actionText={isAdmin ? "Create First Playground" : undefined}
                        actionLink={isAdmin ? `/admin/playgrounds/create?topic=${topic.slug}` : undefined}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* 3e. RESOURCES */}
              {activeHubTab === 'resources' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        Curated Learning Resources ({resources?.length || 0})
                      </h3>
                    </div>
                    {isAdmin && (
                      <Link
                        to={`/admin/resources/create?topic=${topic.slug}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-semibold transition gap-1 border border-indigo-200 dark:border-indigo-800"
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
                                ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            <span>{tab.label}</span>
                            <span
                              className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
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
                  {resourcesError ? (
                    <ErrorState
                      title="Unable to load resources."
                      message="Please try again."
                      onRetry={() => dispatch(fetchResourcesByTopic({ topicId: slug }))}
                      variant="card"
                    />
                  ) : resourcesLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                      <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                    </div>
                  ) : resources && resources.length > 0 ? (
                    (() => {
                      const filteredResources =
                        resourceTypeFilter === 'ALL'
                          ? resources
                          : resources.filter((r) => r.type === resourceTypeFilter);

                      if (filteredResources.length === 0) {
                        return (
                          <EmptyState
                            icon={Globe}
                            title="No matching resources"
                            description="No learning resources found for this selected category filter."
                            actionText="Show All Resources"
                            onAction={() => setResourceTypeFilter('ALL')}
                          />
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
                    <EmptyState
                      icon={Globe}
                      title="No curated resources found"
                      description="No curated resources attached to this topic yet."
                      actionText={isAdmin ? "Attach First Resource" : undefined}
                      actionLink={isAdmin ? `/admin/resources/create?topic=${topic.slug}` : undefined}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
