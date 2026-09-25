import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Terminal,
  Sparkles,
  Code2,
  Trash2,
  Clock,
  Columns,
  Rows,
  AlertTriangle,
  XCircle,
  Info,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { playgroundApi } from '../playgroundApi';

export default function TopicCodePlayground({ topic, codeExamples = [] }) {
  const [activeTabIdx, setActiveTabIdx] = useState(0); // 0..N-1 for examples, or custom
  const [editorCode, setEditorCode] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [layout, setLayout] = useState('stacked'); // 'stacked' | 'split'
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);

  // Normalize code snippets
  const snippets = useMemo(() => {
    if (codeExamples && codeExamples.length > 0) {
      return codeExamples;
    }
    return [
      {
        title: 'Starter Code',
        language: 'javascript',
        code: `// Interactive Playground: ${topic?.title || 'JavaScript'}\nconst message = "Hello, JavaScript!";\nconsole.log(message);\n`,
        explanation: 'Try editing the code above and click Run to see the output in the console.',
      },
    ];
  }, [codeExamples, topic?.title]);

  const activeSnippet = snippets[activeTabIdx] || snippets[0];
  const initialCode = activeSnippet?.code || '';

  // Reset tab index on topic change
  useEffect(() => {
    setActiveTabIdx(0);
    setExecutionResult(null);
  }, [topic?.slug]);

  // Sync editor code whenever active tab changes
  useEffect(() => {
    setEditorCode(initialCode);
    setExecutionResult(null);
  }, [initialCode]);

  // Handle Tab key and Ctrl+Enter hotkey
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunCode();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const newCode = editorCode.substring(0, start) + '  ' + editorCode.substring(end);
      setEditorCode(newCode);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  // Run Code with dual execution (backend API + client sandbox fallback)
  const handleRunCode = async () => {
    if (isExecuting || !editorCode?.trim()) return;
    setIsExecuting(true);
    const startTime = performance.now();

    try {
      const res = await playgroundApi.runCode({
        code: editorCode,
        language: 'javascript',
      });
      if (res?.data) {
        setExecutionResult(res.data);
        return;
      }
      throw new Error(res?.message || 'Empty response');
    } catch {
      // Browser fallback sandbox
      try {
        const logs = [];
        const formatArg = (arg) => {
          if (arg === null) return 'null';
          if (arg === undefined) return 'undefined';
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2);
            } catch {
              return String(arg);
            }
          }
          return String(arg);
        };

        const safeConsole = {
          log: (...args) => logs.push({ type: 'log', message: args.map(formatArg).join(' ') }),
          info: (...args) => logs.push({ type: 'info', message: args.map(formatArg).join(' ') }),
          warn: (...args) => logs.push({ type: 'warn', message: args.map(formatArg).join(' ') }),
          error: (...args) => logs.push({ type: 'error', message: args.map(formatArg).join(' ') }),
        };

        const runner = new Function('console', editorCode);
        const evalResult = runner(safeConsole);
        const endTime = performance.now();

        setExecutionResult({
          logs,
          result: evalResult !== undefined ? formatArg(evalResult) : undefined,
          executionTimeMs: Math.max(1, Math.round(endTime - startTime)),
          error: null,
        });
      } catch (clientErr) {
        const endTime = performance.now();
        setExecutionResult({
          logs: [],
          result: null,
          executionTimeMs: Math.max(1, Math.round(endTime - startTime)),
          error: clientErr?.message || String(clientErr),
        });
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const handleReset = () => {
    setEditorCode(initialCode);
    setExecutionResult(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editorCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearConsole = () => {
    setExecutionResult(null);
  };

  // Line count for gutter
  const lines = (editorCode || '').split('\n');
  const lineCount = Math.max(lines.length, 1);
  const logs = executionResult?.logs || [];
  const error = executionResult?.error;
  const returnValue = executionResult?.result;
  const executionTime = executionResult?.executionTimeMs;

  return (
    <div className="rounded-2xl border border-slate-800/90 bg-slate-950 shadow-xl overflow-hidden text-slate-200">
      {/* 1. Unified Workbench Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-slate-900 border-b border-slate-800">
        {/* Left: Window Dots & Snippet Tabs */}
        <div className="flex items-center space-x-3 overflow-x-auto py-0.5 no-scrollbar">
          {/* macOS Window Controls */}
          <div className="flex space-x-1.5 shrink-0 pl-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          <span className="text-slate-700 select-none shrink-0">|</span>

          {/* Snippet Tabs */}
          <div className="flex items-center space-x-1">
            {snippets.map((snip, idx) => {
              const isActive = activeTabIdx === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveTabIdx(idx)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition shrink-0 ${
                    isActive
                      ? 'bg-slate-950 text-indigo-400 border border-slate-800 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Code2 className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span>{snip.title || `Example ${idx + 1}`}</span>
                </button>
              );
            })}
          </div>

          {/* Snippet Prev / Next arrows */}
          {snippets.length > 1 && (
            <div className="flex items-center space-x-0.5 shrink-0 pl-1 border-l border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTabIdx((prev) => Math.max(0, prev - 1))}
                disabled={activeTabIdx === 0}
                className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-20 transition"
                title="Previous Snippet"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTabIdx((prev) => Math.min(snippets.length - 1, prev + 1))}
                disabled={activeTabIdx === snippets.length - 1}
                className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-20 transition"
                title="Next Snippet"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Actions & Run Button */}
        <div className="flex items-center space-x-1.5 shrink-0 ml-auto">
          {/* Reset */}
          <button
            type="button"
            onClick={handleReset}
            disabled={isExecuting || editorCode === initialCode}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition disabled:opacity-30 disabled:pointer-events-none"
            title="Reset to starter snippet"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Copy */}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition"
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>

          {/* Layout Toggle: Stacked / Split */}
          <div className="hidden sm:inline-flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-800/80 text-xs">
            <button
              type="button"
              onClick={() => setLayout('stacked')}
              className={`p-1.5 rounded-md transition ${
                layout === 'stacked'
                  ? 'bg-slate-800 text-indigo-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Stacked View (Editor on top, Console below)"
            >
              <Rows className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setLayout('split')}
              className={`p-1.5 rounded-md transition ${
                layout === 'split'
                  ? 'bg-slate-800 text-indigo-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Split View (Side-by-side)"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Run Code Button */}
          <button
            type="button"
            onClick={handleRunCode}
            disabled={isExecuting || !editorCode?.trim()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition disabled:opacity-40 disabled:pointer-events-none"
            title="Run Code (Ctrl + Enter)"
          >
            {isExecuting ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-3 h-3 fill-current" />
            )}
            <span>Run</span>
            <kbd className="hidden md:inline-flex items-center text-[10px] bg-emerald-700/80 px-1 py-0.2 rounded font-mono text-emerald-100">
              Ctrl+↵
            </kbd>
          </button>
        </div>
      </div>

      {/* 2. Contextual Concept Explanation Note */}
      {activeSnippet?.explanation && (
        <div className="px-4 py-2 bg-indigo-950/30 border-b border-slate-800/80 text-xs text-indigo-200/90 flex items-center gap-2 leading-relaxed">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>{activeSnippet.explanation}</span>
        </div>
      )}

      {/* 3. Editor & Docked Console Workbench Body */}
      {layout === 'split' ? (
        /* Split Layout: Side-by-Side */
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800/80 min-h-[340px]">
          {/* Left Column: Code Editor */}
          <div className="flex flex-col h-full bg-slate-950">
            <div className="relative flex flex-grow overflow-auto h-[320px]">
              {/* Line Numbers Gutter */}
              <div
                className="select-none py-3.5 px-3 text-right font-mono text-xs text-slate-600 bg-slate-950/80 border-r border-slate-800/60 leading-6 shrink-0"
                aria-hidden="true"
              >
                {Array.from({ length: lineCount }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={editorCode}
                onChange={(e) => setEditorCode(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isExecuting}
                placeholder="// Write your code here..."
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                className="flex-grow p-3.5 bg-transparent text-slate-100 font-mono text-xs sm:text-sm leading-6 outline-none resize-none overflow-auto border-none selection:bg-indigo-600/40 selection:text-white whitespace-pre"
              />
            </div>

            {/* Editor Footer */}
            <div className="px-4 py-1.5 bg-slate-900/60 border-t border-slate-900 text-[10px] text-slate-500 flex justify-between items-center">
              <span>Press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[9px] border border-slate-700">Ctrl</kbd> + <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[9px] border border-slate-700">Enter</kbd> to run</span>
              <span>{lineCount} {lineCount === 1 ? 'line' : 'lines'}</span>
            </div>
          </div>

          {/* Right Column: Docked Console */}
          <div className="flex flex-col h-full bg-slate-950">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/80 border-b border-slate-800/80 text-xs">
              <div className="flex items-center space-x-2">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-300 text-[11px] tracking-wide uppercase">Console Output</span>
                {executionTime !== undefined && !isExecuting && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{executionTime} ms</span>
                  </span>
                )}
                {isExecuting && (
                  <span className="text-[10px] text-indigo-400 animate-pulse">Running...</span>
                )}
              </div>

              {executionResult && (
                <button
                  type="button"
                  onClick={handleClearConsole}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition"
                  title="Clear output"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Terminal Body */}
            <div className="flex-grow p-3.5 overflow-auto font-mono text-xs leading-relaxed space-y-1.5 h-[320px]">
              {isExecuting ? (
                <div className="h-full flex items-center justify-center text-slate-500 gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Executing code...</span>
                </div>
              ) : !executionResult ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-1 select-none">
                  <Terminal className="w-5 h-5 text-slate-700" />
                  <p className="text-xs">Click &quot;Run&quot; or press Ctrl+Enter to execute.</p>
                </div>
              ) : (
                <>
                  {logs.map((log, idx) => {
                    let textClass = 'text-slate-200';
                    let icon = null;
                    if (log.type === 'error') {
                      textClass = 'text-red-400 bg-red-950/30 p-1 rounded border border-red-900/40';
                      icon = <XCircle className="w-3.5 h-3.5 text-red-400 inline mr-1 shrink-0" />;
                    } else if (log.type === 'warn') {
                      textClass = 'text-amber-300';
                      icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-400 inline mr-1 shrink-0" />;
                    } else if (log.type === 'info') {
                      textClass = 'text-sky-300';
                      icon = <Info className="w-3.5 h-3.5 text-sky-400 inline mr-1 shrink-0" />;
                    }
                    return (
                      <div key={idx} className={`flex items-start ${textClass} whitespace-pre-wrap break-all`}>
                        {icon}
                        <span>{log.message}</span>
                      </div>
                    );
                  })}

                  {error && (
                    <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-900/50 text-red-300 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1 text-red-200">
                        <XCircle className="w-3.5 h-3.5 text-red-400" />
                        <span>Error:</span>
                      </div>
                      <div className="text-[11px] whitespace-pre-wrap break-all text-red-300/90">{error}</div>
                    </div>
                  )}

                  {returnValue !== undefined && returnValue !== 'undefined' && !error && (
                    <div className="pt-1.5 border-t border-slate-900 text-indigo-300 flex items-start gap-1.5 text-xs">
                      <span className="text-slate-500 font-bold select-none">&lt;=</span>
                      <span className="text-emerald-400 font-semibold">{returnValue}</span>
                    </div>
                  )}

                  {logs.length === 0 && !error && (returnValue === undefined || returnValue === 'undefined') && (
                    <div className="text-slate-500 italic py-1 text-xs">
                      (Code executed with no console output)
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Stacked Layout: Editor on top, Terminal docked directly below */
        <div className="flex flex-col">
          {/* Top: Code Editor Area */}
          <div className="relative flex overflow-auto min-h-[160px] max-h-[260px] bg-slate-950">
            {/* Line Numbers Gutter */}
            <div
              className="select-none py-3.5 px-3 text-right font-mono text-xs text-slate-600 bg-slate-950/80 border-r border-slate-800/60 leading-6 shrink-0"
              aria-hidden="true"
            >
              {Array.from({ length: lineCount }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={editorCode}
              onChange={(e) => setEditorCode(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isExecuting}
              placeholder="// Write your code here..."
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              className="flex-grow p-3.5 bg-transparent text-slate-100 font-mono text-xs sm:text-sm leading-6 outline-none resize-none overflow-auto border-none selection:bg-indigo-600/40 selection:text-white whitespace-pre"
            />
          </div>

          {/* Terminal Panel Docked Below */}
          <div className="border-t border-slate-800 bg-slate-950/90">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900/80 border-b border-slate-800/80 text-xs">
              <div className="flex items-center space-x-2">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-300 text-[11px] tracking-wide uppercase">Console Output</span>
                {executionTime !== undefined && !isExecuting && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{executionTime} ms</span>
                  </span>
                )}
                {isExecuting && (
                  <span className="text-[10px] text-indigo-400 animate-pulse">Running...</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                  {lineCount} {lineCount === 1 ? 'line' : 'lines'}
                </span>
                {executionResult && (
                  <button
                    type="button"
                    onClick={handleClearConsole}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition"
                    title="Clear output"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-3.5 overflow-auto font-mono text-xs leading-relaxed space-y-1.5 min-h-[90px] max-h-[180px]">
              {isExecuting ? (
                <div className="flex items-center justify-center text-slate-500 py-4 gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Executing code...</span>
                </div>
              ) : !executionResult ? (
                <div className="flex items-center text-slate-600 py-2 select-none gap-2">
                  <Terminal className="w-3.5 h-3.5 text-slate-700" />
                  <span className="text-xs">Click &quot;Run&quot; or press Ctrl+Enter to execute code.</span>
                </div>
              ) : (
                <>
                  {logs.map((log, idx) => {
                    let textClass = 'text-slate-200';
                    let icon = null;
                    if (log.type === 'error') {
                      textClass = 'text-red-400 bg-red-950/30 p-1 rounded border border-red-900/40';
                      icon = <XCircle className="w-3.5 h-3.5 text-red-400 inline mr-1 shrink-0" />;
                    } else if (log.type === 'warn') {
                      textClass = 'text-amber-300';
                      icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-400 inline mr-1 shrink-0" />;
                    } else if (log.type === 'info') {
                      textClass = 'text-sky-300';
                      icon = <Info className="w-3.5 h-3.5 text-sky-400 inline mr-1 shrink-0" />;
                    }
                    return (
                      <div key={idx} className={`flex items-start ${textClass} whitespace-pre-wrap break-all`}>
                        {icon}
                        <span>{log.message}</span>
                      </div>
                    );
                  })}

                  {error && (
                    <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-900/50 text-red-300 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1 text-red-200">
                        <XCircle className="w-3.5 h-3.5 text-red-400" />
                        <span>Error:</span>
                      </div>
                      <div className="text-[11px] whitespace-pre-wrap break-all text-red-300/90">{error}</div>
                    </div>
                  )}

                  {returnValue !== undefined && returnValue !== 'undefined' && !error && (
                    <div className="pt-1.5 border-t border-slate-900 text-indigo-300 flex items-start gap-1.5 text-xs">
                      <span className="text-slate-500 font-bold select-none">&lt;=</span>
                      <span className="text-emerald-400 font-semibold">{returnValue}</span>
                    </div>
                  )}

                  {logs.length === 0 && !error && (returnValue === undefined || returnValue === 'undefined') && (
                    <div className="text-slate-500 italic py-1 text-xs">
                      (Code executed with no console output)
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
