import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, Tag, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function NoteCard({ note, showTopic = true, isCompleted = false }) {
  if (!note) return null;

  const topic = note.topic;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col justify-between group">
      <div className="space-y-3">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
              Note {note.order || 1}
            </span>
            {isCompleted && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Done
              </span>
            )}
            {showTopic && topic && (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Topic: {topic.title || topic.slug}
              </span>
            )}
          </div>

          <div className="flex items-center text-xs font-semibold gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-100 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{note.readingTime || '5 mins'}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition font-sans">
          <Link to={`/notes/${note.slug}`}>{note.title}</Link>
        </h3>

        {/* Summary */}
        {note.summary && (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {note.summary}
          </p>
        )}

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {note.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                <Tag className="w-2.5 h-2.5 mr-1 text-slate-400" />
                {tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                +{note.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Link */}
      <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Study Guide</span>
        </span>

        <Link
          to={`/notes/${note.slug}`}
          className="inline-flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition gap-1"
        >
          <span>Read Note</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
