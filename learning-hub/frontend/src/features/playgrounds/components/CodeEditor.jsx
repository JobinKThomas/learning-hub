import React, { useRef, useState } from 'react';
import { Copy, Check, RotateCcw, Code2 } from 'lucide-react';

export default function CodeEditor({
  code,
  onChange,
  onRun,
  onReset,
  initialCode,
  language = 'javascript',
  disabled = false,
}) {
  const textareaRef = useRef(null);
  const [copied, setCopied] = useState(false);

  // Split lines for the line numbers gutter
  const lines = (code || '').split('\n');
  const lineCount = Math.max(lines.length, 1);

  const handleKeyDown = (e) => {
    // Run hotkey: Ctrl + Enter or Cmd + Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (onRun && !disabled) {
        onRun();
      }
      return;
    }

    // Handle Tab key for 2-space indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      onChange(newCode);

      // Restore cursor position after state update
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-slate-600 pl-1">|</span>
          <div className="flex items-center space-x-1.5 text-slate-300 font-mono text-[11px]">
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold uppercase">{language}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
            {lineCount} {lineCount === 1 ? 'line' : 'lines'}
          </span>

          {initialCode && onReset && (
            <button
              type="button"
              onClick={onReset}
              disabled={disabled || code === initialCode}
              className="inline-flex items-center px-2 py-1 rounded text-[11px] text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-30 disabled:pointer-events-none"
              title="Reset to starter code"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center px-2 py-1 rounded text-[11px] text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 mr-1 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Body: Gutter + Textarea */}
      <div className="relative flex flex-grow overflow-auto min-h-[300px]">
        {/* Line Numbers Gutter */}
        <div
          className="select-none py-4 px-2 sm:px-3 text-right font-mono text-[11px] sm:text-xs text-slate-600 bg-slate-950/80 border-r border-slate-800/60 leading-6 tracking-tight shrink-0"
          aria-hidden="true"
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Code Input */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="// Type your code here..."
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          className="flex-grow p-3 sm:p-4 bg-transparent text-slate-100 font-mono text-sm leading-6 outline-none resize-none overflow-auto border-none selection:bg-indigo-600/40 selection:text-white whitespace-pre"
        />
      </div>

      {/* Shortcut hint footer */}
      <div className="px-4 py-1.5 bg-slate-900/60 border-t border-slate-900 text-[10px] text-slate-500 flex justify-between items-center">
        <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[9px] border border-slate-700">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[9px] border border-slate-700">Enter</kbd> to run</span>
        <span>Tab: 2 spaces</span>
      </div>
    </div>
  );
}
