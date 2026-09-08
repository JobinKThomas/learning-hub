import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNoteBySlug, fetchNotesByTopic, clearCurrentNote } from '../features/notes/noteSlice';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { useAuth } from '../hooks/useAuth';
import {
  updateProgress,
  fetchTopicProgress,
} from '../features/progress/progressSlice';
import CompleteButton from '../features/progress/components/CompleteButton';
import {
  ArrowLeft,
  Clock,
  BookOpen,
  CheckCircle2,
  Circle,
  Tag,
  Edit,
  Share2,
  Check,
  AlertCircle,
  ArrowRight,
  User,
  Calendar,
} from 'lucide-react';

export default function NoteDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentNote: note, notes: siblingNotes, detailsLoading: loading, error } = useSelector(
    (state) => state.notes
  );
  const { currentTopicProgress, actionLoading: progressLoading } = useSelector(
    (state) => state.progress
  );
  const { isAdmin } = useAuth();

  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    if (slug) {
      dispatch(fetchNoteBySlug(slug));
    }
    return () => {
      dispatch(clearCurrentNote());
    };
  }, [dispatch, slug]);

  // Load sibling notes within the same topic & topic progress once note is fetched
  useEffect(() => {
    if (note?.topic?.slug) {
      dispatch(fetchNotesByTopic(note.topic.slug));
      dispatch(fetchTopicProgress(note.topic.slug));
    } else if (note?.topic?._id || note?.topic?.id) {
      dispatch(fetchTopicProgress(note.topic._id || note.topic.id));
    }
  }, [dispatch, note?.topic]);

  const noteId = note?._id || note?.id;
  const isNoteCompleted = Boolean(
    noteId &&
      currentTopicProgress?.completedNotes?.some(
        (id) => id === noteId || id === noteId.toString()
      )
  );

  const handleToggleComplete = async () => {
    if (!note?.topic) return;
    const topicId = note.topic.slug || note.topic._id || note.topic.id;
    await dispatch(
      updateProgress({
        topicId,
        noteId: note.slug || note._id || note.id,
        completed: !isNoteCompleted,
      })
    );
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-64 animate-pulse" />
        <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
        <div className="space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4 animate-pulse" />
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Note Not Found</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          {error || `The note '/notes/${slug}' could not be located.`}
        </p>
        <div>
          <Link
            to="/notes"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Notes
          </Link>
        </div>
      </div>
    );
  }

  // Sibling navigation
  const currentIndex = siblingNotes ? siblingNotes.findIndex((n) => n.slug === note.slug) : -1;
  const prevNote = currentIndex > 0 ? siblingNotes[currentIndex - 1] : null;
  const nextNote =
    currentIndex !== -1 && currentIndex < siblingNotes.length - 1
      ? siblingNotes[currentIndex + 1]
      : null;

  // 5-Tier Hierarchy Extraction
  const topic = note.topic;
  const section = topic?.section;
  const moduleDoc = section?.module;
  const pathDoc = moduleDoc?.learningPath;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 5-Tier Hierarchy Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
          {pathDoc && (
            <>
              <Link
                to={`/learning-paths/${pathDoc.slug}`}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                {pathDoc.title}
              </Link>
              <span>/</span>
            </>
          )}
          {moduleDoc && (
            <>
              <Link
                to={`/modules/${moduleDoc.slug}`}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                {moduleDoc.title}
              </Link>
              <span>/</span>
            </>
          )}
          {section && (
            <>
              <Link
                to={`/sections/${section.slug}`}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
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
            <Link to="/notes" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              Notes
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              to={`/admin/notes/${note.id}/edit`}
              className="inline-flex items-center px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800/60 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-xs font-semibold transition"
            >
              <Edit className="w-3.5 h-3.5 mr-1.5" />
              Edit Note
            </Link>
          )}

          <button
            onClick={handleShare}
            className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition gap-1.5 shadow-xs"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Note Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/60">
            Note {note.order || 1}
          </span>

          {topic && (
            <Link
              to={`/topics/${topic.slug}`}
              className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Topic: {topic.title}
            </Link>
          )}

          {!note.published && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700">
              Draft / Unpublished
            </span>
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight font-sans">
            {note.title}
          </h1>

          {note.summary && (
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              {note.summary}
            </p>
          )}
        </div>

        {/* Metadata bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold px-2.5 py-1 rounded-md">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{note.readingTime || '5 mins'}</span>
            </div>

            {note.createdBy && (
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>Author: {note.createdBy.name}</span>
              </div>
            )}

            {note.updatedAt && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>
                  Updated {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>

          {/* Mark as Completed Button */}
          <CompleteButton
            isCompleted={isNoteCompleted}
            onToggle={handleToggleComplete}
            loading={progressLoading}
            labelActive="Completed"
            labelInactive="Mark as Read"
            size="sm"
          />
        </div>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            {note.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                <Tag className="w-2.5 h-2.5 mr-1 text-slate-400 dark:text-slate-500" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Reader */}
      <article className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-sm leading-relaxed">
        <MarkdownRenderer content={note.content} />
      </article>

      {/* Completion Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {isNoteCompleted ? 'You completed this note! 🎉' : 'Finished reading?'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isNoteCompleted
              ? 'Your progress has been recorded for this topic and learning path.'
              : 'Mark this study note complete to progress through your curriculum milestones.'}
          </p>
        </div>
        <CompleteButton
          isCompleted={isNoteCompleted}
          onToggle={handleToggleComplete}
          loading={progressLoading}
          labelActive="Note Completed"
          labelInactive="Mark as Completed"
          size="md"
        />
      </div>

      {/* Sibling Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        {prevNote ? (
          <Link
            to={`/notes/${prevNote.slug}`}
            className="w-full sm:w-auto inline-flex items-center px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition gap-2 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <div className="text-left">
              <span className="block text-[10px] uppercase text-slate-400 dark:text-slate-500">Previous Note</span>
              <span className="font-bold">{prevNote.title}</span>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {topic && (
          <Link
            to={`/topics/${topic.slug}`}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition"
          >
            <span>Back to {topic.title}</span>
          </Link>
        )}

        {nextNote ? (
          <Link
            to={`/notes/${nextNote.slug}`}
            className="w-full sm:w-auto inline-flex items-center justify-end px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition gap-2 text-right shadow-xs"
          >
            <div>
              <span className="block text-[10px] uppercase text-slate-400 dark:text-slate-500">Next Note</span>
              <span className="font-bold">{nextNote.title}</span>
            </div>
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
