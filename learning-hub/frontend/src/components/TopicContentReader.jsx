import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Clock,
  Copy,
  Check,
  Code2,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  Info,
  ChevronRight,
  Compass,
  CheckCircle2,
  FileText,
} from 'lucide-react';

/**
 * Syntax highlighter helper for code snippet lines.
 */
function SyntaxHighlightedLine({ line }) {
  if (!line) return <span>&nbsp;</span>;

  // Trim trailing carriage returns
  const cleanLine = line.replace(/\r$/, '');

  // Check for whole-line comment
  if (cleanLine.trim().startsWith('//')) {
    return <span className="text-slate-400 dark:text-slate-500 italic">{cleanLine}</span>;
  }

  // Regex tokenizer for JS/TS code
  // 1: comments, 2: strings, 3: keywords, 4: numbers, 5: booleans/null, 6: function calls
  const tokenRegex =
    /(\/\/[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|import|export|from|default|async|await|try|catch|finally|throw|typeof|instanceof)\b)|(\b\d+(?:\.\d+)?\b)|(\b(?:true|false|null|undefined)\b)|(\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\())/g;

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(cleanLine)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={lastIndex} className="text-slate-200">
          {cleanLine.substring(lastIndex, match.index)}
        </span>
      );
    }

    const [full, comment, string, keyword, number, boolNull, func] = match;

    if (comment) {
      parts.push(
        <span key={match.index} className="text-slate-400 dark:text-slate-500 italic">
          {comment}
        </span>
      );
    } else if (string) {
      parts.push(
        <span key={match.index} className="text-amber-300 dark:text-amber-200">
          {string}
        </span>
      );
    } else if (keyword) {
      parts.push(
        <span key={match.index} className="text-purple-400 font-semibold">
          {keyword}
        </span>
      );
    } else if (number) {
      parts.push(
        <span key={match.index} className="text-orange-400">
          {number}
        </span>
      );
    } else if (boolNull) {
      parts.push(
        <span key={match.index} className="text-rose-400 font-semibold">
          {boolNull}
        </span>
      );
    } else if (func) {
      parts.push(
        <span key={match.index} className="text-sky-300">
          {func}
        </span>
      );
    }

    lastIndex = match.index + full.length;
  }

  if (lastIndex < cleanLine.length) {
    parts.push(
      <span key={lastIndex} className="text-slate-200">
        {cleanLine.substring(lastIndex)}
      </span>
    );
  }

  return <>{parts}</>;
}

/**
 * Enhanced Code Block Component with Copy feedback and terminal styling.
 */
function CodeBlock({ code, language = 'javascript', title = 'Code Example' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeLines = code.split('\n');

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-md">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/90 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/90 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/90 inline-block" />
          </div>
          <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 ml-1">
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            {title}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-slate-800 text-slate-400">
            {language}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code snippet"
          className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition gap-1.5 border border-slate-700/50"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Area with line numbers */}
      <div className="p-4 font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto">
        <pre className="m-0 p-0">
          <code>
            {codeLines.map((line, idx) => (
              <div key={idx} className="table-row">
                <span className="table-cell select-none pr-4 text-right text-slate-600 text-[11px] w-6">
                  {idx + 1}
                </span>
                <span className="table-cell whitespace-pre">
                  <SyntaxHighlightedLine line={line} />
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

/**
 * Callout Card for Notes, Tips, Warnings, Best Practices.
 */
function CalloutBox({ type = 'note', title, content }) {
  const configs = {
    tip: {
      border: 'border-emerald-200 dark:border-emerald-800/80',
      bg: 'bg-emerald-50/70 dark:bg-emerald-950/30',
      text: 'text-emerald-900 dark:text-emerald-200',
      icon: <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />,
      defaultTitle: 'Tip',
    },
    warning: {
      border: 'border-amber-200 dark:border-amber-800/80',
      bg: 'bg-amber-50/70 dark:bg-amber-950/30',
      text: 'text-amber-900 dark:text-amber-200',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />,
      defaultTitle: 'Warning',
    },
    important: {
      border: 'border-rose-200 dark:border-rose-800/80',
      bg: 'bg-rose-50/70 dark:bg-rose-950/30',
      text: 'text-rose-900 dark:text-rose-200',
      icon: <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />,
      defaultTitle: 'Important',
    },
    practice: {
      border: 'border-purple-200 dark:border-purple-800/80',
      bg: 'bg-purple-50/70 dark:bg-purple-950/30',
      text: 'text-purple-900 dark:text-purple-200',
      icon: <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />,
      defaultTitle: 'Best Practice',
    },
    note: {
      border: 'border-indigo-200 dark:border-indigo-800/80',
      bg: 'bg-indigo-50/70 dark:bg-indigo-950/30',
      text: 'text-indigo-900 dark:text-indigo-200',
      icon: <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />,
      defaultTitle: 'Note',
    },
  };

  const config = configs[type] || configs.note;

  return (
    <div
      className={`my-4 p-4 rounded-xl border ${config.border} ${config.bg} flex items-start gap-3 transition-all shadow-xs`}
    >
      {config.icon}
      <div className="space-y-1 text-xs sm:text-sm leading-relaxed">
        <h5 className={`font-bold ${config.text}`}>{title || config.defaultTitle}</h5>
        <div className="text-slate-700 dark:text-slate-300">{content}</div>
      </div>
    </div>
  );
}

/**
 * Main Topic Content Reader Component
 */
export default function TopicContentReader({
  content,
  title = 'Detailed Explanation & Best Practices',
  emptyText = 'Detailed notes for this lesson will be available soon.',
}) {
  const [fontSize, setFontSize] = useState('normal'); // 'compact', 'normal', 'spacious'
  const [copiedAll, setCopiedAll] = useState(false);

  // Calculate reading stats (reading time & word count)
  const { readingTimeMinutes, wordCount } = useMemo(() => {
    if (!content) return { readingTimeMinutes: 1, wordCount: 0 };
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const time = Math.max(1, Math.ceil(words / 180));
    return { readingTimeMinutes: time, wordCount: words };
  }, [content]);

  // Copy full topic content
  const handleCopyAll = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Helper for inline text formatting (code, bold, italic, links)
  const renderInline = (text) => {
    if (!text) return null;

    const parts = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Inline code: `...`
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        parts.push(
          <code
            key={key++}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-mono text-xs border border-indigo-200/70 dark:border-slate-700 font-medium"
          >
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // Bold: **...**
      const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
      if (boldMatch) {
        parts.push(
          <strong key={key++} className="font-bold text-slate-900 dark:text-slate-100">
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // Italic: *...*
      const italicMatch = remaining.match(/^\*([^*]+)\*/);
      if (italicMatch) {
        parts.push(
          <em key={key++} className="italic text-slate-800 dark:text-slate-200">
            {italicMatch[1]}
          </em>
        );
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // Plain text up to next special delimiter
      const nextSpecial = remaining.search(/[`*]/);
      if (nextSpecial === -1) {
        parts.push(remaining);
        break;
      } else {
        parts.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }

    return parts;
  };

  // Parse sections and elements from raw markdown/text
  const { parsedSections, tableOfContents } = useMemo(() => {
    if (!content) return { parsedSections: [], tableOfContents: [] };

    const rawLines = content.split('\n');
    const sections = [];
    const toc = [];

    let currentSection = {
      id: 'section-intro',
      number: null,
      title: null,
      elements: [],
    };

    let i = 0;
    let blockId = 0;

    // Helper to test if a line resembles code
    const isCodeLine = (str) => {
      const trimmed = str.trim();
      if (!trimmed) return false;
      return (
        /^(const|let|var|function|return|import|export|class|console\.|document\.|window\.|if\s*\(|switch\s*\(|for\s*\(|while\s*\(|try|catch|finally|throw)/.test(
          trimmed
        ) ||
        /[;{}]$/.test(trimmed) ||
        trimmed.startsWith('//') ||
        trimmed.startsWith('/*') ||
        trimmed.startsWith('<')
      );
    };

    while (i < rawLines.length) {
      const line = rawLines[i];
      const trimmed = line.trim();

      // Check for Major Section Header
      // Matches "1. What is JavaScript?", "1) ...", or "# ...", "## ..."
      const numberedHeaderMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)$/);
      const mdHeaderMatch = trimmed.match(/^(#{1,3})\s+(.*)$/);

      if (numberedHeaderMatch || mdHeaderMatch) {
        // Commit previous section if it had content
        if (currentSection.elements.length > 0 || currentSection.title) {
          sections.push(currentSection);
        }

        const secNumber = numberedHeaderMatch ? numberedHeaderMatch[1] : sections.length + 1;
        const secTitle = numberedHeaderMatch ? numberedHeaderMatch[2] : mdHeaderMatch[2];
        const secId = `section-${secNumber}-${secTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

        toc.push({ id: secId, number: secNumber, title: secTitle });

        currentSection = {
          id: secId,
          number: secNumber,
          title: secTitle,
          elements: [],
        };
        i++;
        continue;
      }

      // Check for Fenced Code Block (```)
      if (trimmed.startsWith('```')) {
        const lang = trimmed.slice(3).trim() || 'javascript';
        const codeLines = [];
        i++;
        while (i < rawLines.length && !rawLines[i].trim().startsWith('```')) {
          codeLines.push(rawLines[i]);
          i++;
        }
        i++; // skip closing ```
        currentSection.elements.push({
          type: 'code',
          id: `code-${blockId++}`,
          code: codeLines.join('\n'),
          language: lang,
          title: `${lang.toUpperCase()} Code`,
        });
        continue;
      }

      // Check for "Example:" or "Code Guide:" label followed by code block
      if (/^(Example|Sample Code|Code Example|Code Guide|Code Reference|Code Snippet|Code):?$/i.test(trimmed)) {
        let exampleTitle = trimmed.replace(/:$/, '');
        i++;
        // Skip leading blank lines
        while (i < rawLines.length && !rawLines[i].trim()) {
          i++;
        }

        // Collect code lines with peek-ahead for blank lines
        const codeLines = [];
        while (i < rawLines.length) {
          const cLine = rawLines[i];
          const cTrimmed = cLine.trim();

          // Break if encountering next section, markdown header, or callout
          if (
            cTrimmed.match(/^\d+[\.\)]\s+/) ||
            cTrimmed.match(/^#{1,3}\s+/) ||
            cTrimmed.match(/^(Note|Tip|Warning|Important|Best Practice):/i)
          ) {
            break;
          }

          // Handle blank lines inside code block: peek ahead
          if (!cTrimmed) {
            let lookAhead = i + 1;
            while (lookAhead < rawLines.length && !rawLines[lookAhead].trim()) {
              lookAhead++;
            }
            if (
              lookAhead >= rawLines.length ||
              rawLines[lookAhead].trim().match(/^\d+[\.\)]\s+/) ||
              rawLines[lookAhead].trim().match(/^#{1,3}\s+/) ||
              !isCodeLine(rawLines[lookAhead])
            ) {
              break;
            }
            codeLines.push('');
            i++;
            continue;
          }

          // Non-empty line: if we already have code and this line doesn't look like code and is not indented, stop
          if (codeLines.length > 0 && !isCodeLine(cLine) && !cLine.startsWith('  ') && !cLine.startsWith('\t')) {
            break;
          }

          codeLines.push(cLine);
          i++;
        }

        if (codeLines.length > 0) {
          currentSection.elements.push({
            type: 'code',
            id: `code-${blockId++}`,
            code: codeLines.join('\n'),
            language: 'javascript',
            title: exampleTitle,
          });
        }
        continue;
      }

      // Check for standalone code lines without explicit "Example:" label
      if (isCodeLine(line) && !trimmed.startsWith('-') && !trimmed.startsWith('*')) {
        const codeLines = [line];
        i++;
        while (
          i < rawLines.length &&
          (rawLines[i].trim() === '' || isCodeLine(rawLines[i])) &&
          !rawLines[i].trim().match(/^\d+[\.\)]\s+/) &&
          !rawLines[i].trim().match(/^#{1,3}\s+/)
        ) {
          // If 2 empty lines in a row, stop code block
          if (rawLines[i].trim() === '' && i + 1 < rawLines.length && rawLines[i + 1].trim() === '') {
            break;
          }
          codeLines.push(rawLines[i]);
          i++;
        }

        // Clean trailing empty lines
        while (codeLines.length && !codeLines[codeLines.length - 1].trim()) {
          codeLines.pop();
        }

        if (codeLines.length > 0) {
          currentSection.elements.push({
            type: 'code',
            id: `code-${blockId++}`,
            code: codeLines.join('\n'),
            language: 'javascript',
            title: 'Code Snippet',
          });
        }
        continue;
      }

      // Check for Callout Boxes (e.g. "Note:", "Tip:", "Important:", "Best Practice:")
      const calloutMatch = trimmed.match(/^(Note|Tip|Warning|Important|Best Practice):\s*(.*)$/i);
      if (calloutMatch) {
        const typeStr = calloutMatch[1].toLowerCase().replace(/\s+/, '');
        const calloutType = typeStr === 'bestpractice' ? 'practice' : typeStr;
        currentSection.elements.push({
          type: 'callout',
          id: `callout-${blockId++}`,
          calloutType,
          title: calloutMatch[1],
          content: calloutMatch[2],
        });
        i++;
        continue;
      }

      // Check for Bullet Lists (- or * or •)
      if (trimmed.match(/^[-*•]\s+/)) {
        const listItems = [];
        while (i < rawLines.length && rawLines[i].trim().match(/^[-*•]\s+/)) {
          listItems.push(rawLines[i].trim().replace(/^[-*•]\s+/, ''));
          i++;
        }
        currentSection.elements.push({
          type: 'bullet-list',
          id: `list-${blockId++}`,
          items: listItems,
        });
        continue;
      }

      // Sub-heading indicators (e.g., "For example, JavaScript can be used to:")
      if (
        (trimmed.endsWith(':') && trimmed.length < 80) ||
        trimmed.startsWith('### ')
      ) {
        const subTitle = trimmed.startsWith('### ') ? trimmed.slice(4) : trimmed;
        currentSection.elements.push({
          type: 'subheading',
          id: `subhead-${blockId++}`,
          text: subTitle,
        });
        i++;
        continue;
      }

      // Markdown Tables (| Header |)
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const tableLines = [];
        while (i < rawLines.length && rawLines[i].trim().startsWith('|') && rawLines[i].trim().endsWith('|')) {
          tableLines.push(rawLines[i].trim());
          i++;
        }
        if (tableLines.length >= 2) {
          const headerCells = tableLines[0].split('|').slice(1, -1).map((c) => c.trim());
          const bodyRows = tableLines.slice(2).map((row) =>
            row.split('|').slice(1, -1).map((c) => c.trim())
          );
          currentSection.elements.push({
            type: 'table',
            id: `table-${blockId++}`,
            headers: headerCells,
            rows: bodyRows,
          });
        }
        continue;
      }

      // Empty Lines
      if (!trimmed) {
        i++;
        continue;
      }

      // Regular Paragraph
      currentSection.elements.push({
        type: 'paragraph',
        id: `p-${blockId++}`,
        text: trimmed,
      });
      i++;
    }

    if (currentSection.elements.length > 0 || currentSection.title) {
      sections.push(currentSection);
    }

    return { parsedSections: sections, tableOfContents: toc };
  }, [content]);

  // Typography size classes based on font-size toggle
  const fontStyles = {
    compact: {
      body: 'text-xs sm:text-sm leading-normal',
      heading: 'text-base font-bold',
      list: 'text-xs sm:text-sm',
    },
    normal: {
      body: 'text-sm sm:text-[15px] leading-relaxed',
      heading: 'text-lg sm:text-xl font-bold',
      list: 'text-sm sm:text-[15px]',
    },
    spacious: {
      body: 'text-base sm:text-lg leading-loose',
      heading: 'text-xl sm:text-2xl font-bold',
      list: 'text-base sm:text-lg',
    },
  };

  const activeFont = fontStyles[fontSize] || fontStyles.normal;

  if (!content) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center py-12 space-y-3">
        <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {emptyText}
        </p>
      </div>
    );
  }

  const scrollToSection = (secId) => {
    const el = document.getElementById(secId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
      {/* Top Header & Reader Controls Toolbar */}
      <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Title & Metadata */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              {title}
            </h2>
            <div className="flex items-center gap-2.5 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                {readingTimeMinutes} min read
              </span>
              <span>•</span>
              <span>{wordCount} words</span>
              {tableOfContents.length > 1 && (
                <>
                  <span>•</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                    {tableOfContents.length} sections
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls: Font Size & Copy */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {/* Font Size Selector */}
          <div
            className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs"
            title="Adjust reading text size"
          >
            <button
              type="button"
              onClick={() => setFontSize('compact')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                fontSize === 'compact'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => setFontSize('normal')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                fontSize === 'normal'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setFontSize('spacious')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                fontSize === 'spacious'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              A+
            </button>
          </div>

          {/* Copy Full Guide Button */}
          <button
            type="button"
            onClick={handleCopyAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs transition"
          >
            {copiedAll ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Note</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick-Jump Section Navigator (if multiple sections exist) */}
      {tableOfContents.length > 1 && (
        <div className="px-4 sm:px-6 py-3 bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2 font-semibold">
            <Compass className="w-3.5 h-3.5 text-indigo-500" />
            <span>Guide Outline:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tableOfContents.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition shadow-2xs"
              >
                <span className="w-4 h-4 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 text-[10px] font-mono font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="truncate max-w-[180px] sm:max-w-[240px]">{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Sections */}
      <div className="p-5 sm:p-8 space-y-8">
        {parsedSections.map((section, sIdx) => (
          <article
            key={section.id}
            id={section.id}
            className={`space-y-4 scroll-mt-6 ${
              sIdx > 0
                ? 'pt-8 border-t border-slate-200/70 dark:border-slate-800/80'
                : ''
            }`}
          >
            {/* Section Heading with Accent Pill */}
            {section.title && (
              <div className="flex items-start gap-3 mb-4">
                {section.number && (
                  <span className="px-2.5 py-1 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-mono font-bold text-xs tracking-wider shadow-xs shrink-0 mt-0.5">
                    {String(section.number).padStart(2, '0')}
                  </span>
                )}
                <div>
                  <h3 className={`${activeFont.heading} text-slate-900 dark:text-slate-100 tracking-tight`}>
                    {section.title}
                  </h3>
                </div>
              </div>
            )}

            {/* Section Elements */}
            <div className="space-y-4">
              {section.elements.map((el) => {
                switch (el.type) {
                  case 'code':
                    return (
                      <CodeBlock
                        key={el.id}
                        code={el.code}
                        language={el.language}
                        title={el.title}
                      />
                    );

                  case 'callout':
                    return (
                      <CalloutBox
                        key={el.id}
                        type={el.calloutType}
                        title={el.title}
                        content={renderInline(el.content)}
                      />
                    );

                  case 'subheading':
                    return (
                      <div key={el.id} className="pt-2 pb-1">
                        <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                          <ChevronRight className="w-3.5 h-3.5" />
                          {el.text}
                        </h4>
                      </div>
                    );

                  case 'bullet-list':
                    return (
                      <div
                        key={el.id}
                        className="my-3 space-y-2 pl-1 sm:pl-2"
                      >
                        {el.items.map((item, lIdx) => (
                          <div
                            key={lIdx}
                            className="flex items-start gap-3 text-slate-700 dark:text-slate-300"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shrink-0 mt-2" />
                            <div className={`${activeFont.list} leading-relaxed`}>
                              {renderInline(item)}
                            </div>
                          </div>
                        ))}
                      </div>
                    );

                  case 'table':
                    return (
                      <div
                        key={el.id}
                        className="my-5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs"
                      >
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs sm:text-sm">
                          <thead className="bg-slate-50 dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-200">
                            <tr>
                              {el.headers.map((hc, hIdx) => (
                                <th key={hIdx} className="px-4 py-3">
                                  {renderInline(hc)}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
                            {el.rows.map((row, rIdx) => (
                              <tr
                                key={rIdx}
                                className="hover:bg-slate-50/70 dark:hover:bg-slate-900/60 transition"
                              >
                                {row.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className="px-4 py-3 text-slate-600 dark:text-slate-300"
                                  >
                                    {renderInline(cell)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );

                  case 'paragraph':
                  default:
                    return (
                      <p
                        key={el.id}
                        className={`${activeFont.body} text-slate-700 dark:text-slate-300`}
                      >
                        {renderInline(el.text)}
                      </p>
                    );
                }
              })}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
