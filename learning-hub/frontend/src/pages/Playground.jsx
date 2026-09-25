import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPlaygroundBySlug,
  runCodeExecution,
  clearExecutionResult,
  clearCurrentPlayground,
} from '../features/playgrounds/playgroundSlice';
import CodeEditor from '../features/playgrounds/components/CodeEditor';
import ConsoleOutput from '../features/playgrounds/components/ConsoleOutput';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { useAuth } from '../hooks/useAuth';
import {
  ArrowLeft,
  Play,
  RotateCcw,
  Sparkles,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Edit,
  Terminal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function Playground() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAdmin } = useAuth();

  const {
    currentPlayground: playground,
    detailsLoading: loading,
    executionResult,
    isExecuting,
    error,
  } = useSelector((state) => state.playgrounds);

  const [code, setCode] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [activeTab, setActiveTab] = useState('instructions'); // 'instructions' | 'hints'

  useEffect(() => {
    if (slug) {
      dispatch(fetchPlaygroundBySlug(slug));
    }
    return () => {
      dispatch(clearCurrentPlayground());
    };
  }, [dispatch, slug]);

  // Sync initialCode once playground is loaded
  useEffect(() => {
    if (playground?.initialCode) {
      setCode(playground.initialCode);
    }
  }, [playground?.initialCode]);

  const handleRun = () => {
    if (isExecuting || !code) return;
    dispatch(
      runCodeExecution({
        code,
        language: playground?.language || 'javascript',
        playgroundId: playground?.id || null,
      })
    );
  };

  const handleReset = () => {
    if (playground?.initialCode) {
      setCode(playground.initialCode);
      dispatch(clearExecutionResult());
    }
  };

  const handleClearConsole = () => {
    dispatch(clearExecutionResult());
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-64 animate-pulse" />
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[600px] bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          <div className="h-[600px] bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !playground) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Playground Not Found</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          {error || `The playground '/playgrounds/${slug}' could not be located.`}
        </p>
        <div>
          <Link
            to="/learning-paths"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Curriculum
          </Link>
        </div>
      </div>
    );
  }

  // 5-Tier Hierarchy Extraction
  const topic = playground.topic;
  const section = topic?.section;
  const moduleDoc = section?.module;
  const pathDoc = moduleDoc?.learningPath;

  const difficultyColors = {
    BEGINNER: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    INTERMEDIATE: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    ADVANCED: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  };
  const diffBadge = difficultyColors[playground.difficulty] || difficultyColors.BEGINNER;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 5-Tier Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
          {pathDoc && (
            <>
              <Link to={`/learning-paths/${pathDoc.slug}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                {pathDoc.title}
              </Link>
              <span>/</span>
            </>
          )}
          {moduleDoc && (
            <>
              <Link to={`/modules/${moduleDoc.slug}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                {moduleDoc.title}
              </Link>
              <span>/</span>
            </>
          )}
          {section && (
            <>
              <Link to={`/sections/${section.slug}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                {section.title}
              </Link>
              <span>/</span>
            </>
          )}
          {topic ? (
            <Link
              to={`/topics/${topic.slug}`}
              className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-800 dark:hover:text-indigo-300 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              {topic.title}
            </Link>
          ) : (
            <Link to="/learning-paths" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              Curriculum
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              to={`/admin/playgrounds/${playground.id}/edit`}
              className="inline-flex items-center px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800/60 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-xs font-semibold transition"
            >
              <Edit className="w-3.5 h-3.5 mr-1.5" />
              Edit Playground (Admin)
            </Link>
          )}

          {topic && (
            <Link
              to={`/topics/${topic.slug}`}
              className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition gap-1 shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to {topic.title}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Playground Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${diffBadge}`}>
              {playground.difficulty || 'BEGINNER'}
            </span>
            <span className="text-xs font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
              <Terminal className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              {playground.language || 'javascript'}
            </span>
            {topic && (
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/60">
                Topic: {topic.title}
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {playground.title}
          </h1>

          {playground.description && (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              {playground.description}
            </p>
          )}
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
          <button
            type="button"
            onClick={handleRun}
            disabled={isExecuting}
            className="w-full md:w-auto min-h-[44px] justify-center inline-flex items-center px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 disabled:pointer-events-none gap-2"
          >
            {isExecuting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Executing...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run Code</span>
                <span className="text-indigo-200 text-xs hidden sm:inline">(Ctrl+Enter)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Instructions, Expected Output, Hints */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('instructions')}
                className={`flex-1 py-3 px-4 text-center border-b-2 transition ${
                  activeTab === 'instructions'
                    ? 'border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                Instructions
              </button>
              {playground.hints && playground.hints.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('hints')}
                  className={`flex-1 py-3 px-4 text-center border-b-2 transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'hints'
                      ? 'border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Hints ({playground.hints.length})</span>
                </button>
              )}
            </div>

            {/* Tab Body */}
            <div className="p-5 overflow-auto max-h-[520px] text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
              {activeTab === 'instructions' ? (
                <>
                  {playground.instructions ? (
                    <MarkdownRenderer content={playground.instructions} />
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400 italic">
                      No additional instructions provided for this sandbox. Experiment with the starter code!
                    </p>
                  )}

                  {/* Expected Output block if provided */}
                  {playground.expectedOutput && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Target Output:</span>
                      </div>
                      <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto border border-slate-800">
                        <code>{playground.expectedOutput}</code>
                      </pre>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs pb-1 border-b border-slate-100 dark:border-slate-800">
                    <Sparkles className="w-4 h-4" />
                    <span>Helpful Conceptual Hints</span>
                  </div>
                  {playground.hints.map((hint, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-950 dark:text-indigo-200 flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{hint}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Code Editor & Execution Console */}
        <div className="lg:col-span-7 space-y-5">
          {/* Top: Code Editor */}
          <div className="h-[380px]">
            <CodeEditor
              code={code}
              onChange={setCode}
              onRun={handleRun}
              onReset={handleReset}
              initialCode={playground.initialCode}
              language={playground.language || 'javascript'}
              disabled={isExecuting}
            />
          </div>

          {/* Bottom: Execution Console */}
          <div className="min-h-[220px]">
            <ConsoleOutput
              result={executionResult}
              isExecuting={isExecuting}
              onClear={handleClearConsole}
              expectedOutput={playground.expectedOutput}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
