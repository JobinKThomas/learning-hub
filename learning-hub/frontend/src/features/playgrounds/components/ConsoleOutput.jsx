import React from 'react';
import {
  Terminal,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Sparkles,
} from 'lucide-react';

export default function ConsoleOutput({
  result,
  isExecuting,
  onClear,
  expectedOutput,
}) {
  const logs = result?.logs || [];
  const error = result?.error;
  const returnValue = result?.result;
  const executionTime = result?.executionTimeMs;
  const matchesExpected = result?.matchesExpectedOutput;

  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl">
      {/* Console Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-slate-200">Execution Console</span>
          {isExecuting && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 animate-pulse">
              Running...
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {executionTime !== undefined && (
            <div className="flex items-center text-[11px] text-slate-400">
              <Clock className="w-3 h-3 mr-1 text-slate-500" />
              <span>{executionTime} ms</span>
            </div>
          )}

          {result && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center px-2 py-1 rounded text-[11px] text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Clear console output"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Challenge Match Banner */}
      {expectedOutput && result && (
        <div
          className={`px-4 py-2 text-xs flex items-center justify-between border-b ${
            matchesExpected
              ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
              : 'bg-amber-950/60 border-amber-800/60 text-amber-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {matchesExpected ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">
                  Challenge Complete! Output matches expected target.
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Output does not match expected challenge target yet.</span>
              </>
            )}
          </div>
          {matchesExpected && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200">
              PASSED
            </span>
          )}
        </div>
      )}

      {/* Console Output Body */}
      <div className="flex-grow p-4 overflow-auto font-mono text-xs leading-relaxed space-y-1.5 min-h-[160px]">
        {isExecuting ? (
          <div className="flex items-center space-x-2 text-slate-400 py-6 justify-center">
            <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Executing code in sandbox...</span>
          </div>
        ) : !result ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 py-10 space-y-2 select-none">
            <Sparkles className="w-6 h-6 text-slate-700" />
            <p className="text-xs">Output from your code will appear here.</p>
            <p className="text-[11px] text-slate-700">Click &quot;Run Code&quot; to execute.</p>
          </div>
        ) : (
          <>
            {/* Logs from console.log, console.info, console.warn, console.error */}
            {logs.map((log, idx) => {
              let textClass = 'text-slate-200';
              let icon = null;

              if (log.type === 'error') {
                textClass = 'text-red-400 bg-red-950/30 p-1.5 rounded border border-red-900/50';
                icon = <XCircle className="w-3.5 h-3.5 text-red-400 inline mr-1.5 shrink-0" />;
              } else if (log.type === 'warn') {
                textClass = 'text-amber-300 bg-amber-950/30 p-1.5 rounded border border-amber-900/50';
                icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-400 inline mr-1.5 shrink-0" />;
              } else if (log.type === 'info') {
                textClass = 'text-sky-300';
                icon = <Info className="w-3.5 h-3.5 text-sky-400 inline mr-1.5 shrink-0" />;
              }

              return (
                <div key={idx} className={`flex items-start ${textClass} whitespace-pre-wrap break-all`}>
                  {icon}
                  <span>{log.message}</span>
                </div>
              );
            })}

            {/* General Execution Error */}
            {error && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-900/60 text-red-300 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-red-200 text-xs">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Execution Error:</span>
                </div>
                <div className="text-[11px] text-red-300/90 whitespace-pre-wrap break-all">
                  {error}
                </div>
              </div>
            )}

            {/* Non-undefined return value */}
            {returnValue !== undefined && returnValue !== 'undefined' && !error && (
              <div className="pt-2 border-t border-slate-900 text-indigo-300 flex items-start space-x-2">
                <span className="text-slate-500 font-bold select-none">&lt;=</span>
                <span className="text-emerald-400 font-semibold">{returnValue}</span>
              </div>
            )}

            {logs.length === 0 && !error && (returnValue === undefined || returnValue === 'undefined') && (
              <div className="text-slate-500 italic py-2">
                (Code completed with no console output or return value)
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
