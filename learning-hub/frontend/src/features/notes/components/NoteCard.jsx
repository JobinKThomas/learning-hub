import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, Tag, ArrowRight } from 'lucide-react';

export default function NoteCard({ note, showTopic = true }) {
  if (!note) return null;

  const topic = note.topic;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col justify-between group">
      <div className="space-y-3">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              Note {note.order || 1}
            </span>
            {showTopic && topic && (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Topic: {topic.title || topic.slug}
              </span>
            )}
          </div>

          <div className="flex items-center text-xs font-semibold text-slate-500 gap-1 bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-100">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{note.readingTime || '5 mins'}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition font-sans">
          <Link to={`/notes/${note.slug}`}>{note.title}</Link>
        </h3>

        {/* Summary */}
        {note.summary && (
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {note.summary}
          </p>
        )}

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {note.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200"
              >
                <Tag className="w-2.5 h-2.5 mr-1 text-slate-400" />
                {tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-[10px] text-slate-400 font-medium">
                +{note.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Link */}
      <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Study Guide</span>
        </span>

        <Link
          to={`/notes/${note.slug}`}
          className="inline-flex items-center text-xs font-bold text-indigo-600 group-hover:text-indigo-700 transition gap-1"
        >
          <span>Read Note</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
