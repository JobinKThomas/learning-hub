import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  fetchNoteById,
  updateNote,
  clearCurrentNote,
} from '../../features/notes/noteSlice';
import { fetchTopics } from '../../features/topics/topicSlice';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import {
  ArrowLeft,
  Save,
  BookOpen,
  Eye,
  Edit3,
  AlertCircle,
  RefreshCw,
  Tag,
  Clock,
} from 'lucide-react';

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function EditNote() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { topics } = useSelector((state) => state.topics);
  const { currentNote: note, detailsLoading, actionLoading, error } = useSelector(
    (state) => state.notes
  );

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    topic: '',
    summary: '',
    readingTime: '5 mins',
    order: 1,
    tagsInput: '',
    content: '',
    published: true,
  });

  const [activeTab, setActiveTab] = useState('write');
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    dispatch(fetchTopics());
    if (id) {
      dispatch(fetchNoteById(id));
    }
    return () => {
      dispatch(clearCurrentNote());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        slug: note.slug || '',
        topic: note.topic?.id || note.topicId || note.topic?._id || '',
        summary: note.summary || '',
        readingTime: note.readingTime || '5 mins',
        order: note.order ?? 1,
        tagsInput: Array.isArray(note.tags) ? note.tags.join(', ') : '',
        content: note.content || '',
        published: note.published !== false,
      });
    }
  }, [note]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSlugChange = (e) => {
    setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError('Note title is required.');
      return;
    }
    if (!formData.content.trim()) {
      setFormError('Markdown content is required.');
      return;
    }

    const tags = formData.tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const updatePayload = {
      title: formData.title.trim(),
      slug: formData.slug.trim() || slugify(formData.title),
      summary: formData.summary.trim(),
      readingTime: formData.readingTime.trim() || '5 mins',
      order: Number(formData.order) || 1,
      tags,
      content: formData.content.trim(),
      published: formData.published,
    };

    if (formData.topic) {
      updatePayload.topic = formData.topic;
    }

    try {
      const updated = await dispatch(updateNote({ id, data: updatePayload })).unwrap();
      navigate(`/notes/${updated.slug}`);
    } catch (err) {
      setFormError(err || 'Failed to update note');
    }
  };

  if (detailsLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-600" />
        <p className="text-xs text-slate-500 font-medium">Loading note for editing...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Navigation Breadcrumb */}
      <Link
        to="/admin/notes"
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-purple-700 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Notes Administration
      </Link>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-semibold border border-purple-400/30">
            <BookOpen className="w-3.5 h-3.5 text-purple-300" />
            <span>Edit Study Note</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans">
            {formData.title || 'Edit Note'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Modify guide contents, code examples, topic attachments, or publication status.
          </p>
        </div>
      </div>

      {/* Error Feedback */}
      {(formError || error) && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{formError || error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Topic Selection */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Parent Topic <span className="text-red-500">*</span>
          </label>
          <select
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          >
            <option value="" disabled>
              Select a Topic
            </option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.section?.title ? `${t.section.title}` : 'Topic'})
              </option>
            ))}
          </select>
        </div>

        {/* Title & Slug */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Note Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., What is let?"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              URL Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleSlugChange}
              placeholder="what-is-let"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-mono text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Summary / Lead Overview
          </label>
          <textarea
            name="summary"
            rows="2"
            value={formData.summary}
            onChange={handleChange}
            placeholder="A concise abstract introducing the core concept..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
        </div>

        {/* Reading Time, Order, Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Reading Time
            </label>
            <input
              type="text"
              name="readingTime"
              value={formData.readingTime}
              onChange={handleChange}
              placeholder="5 mins"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Display Order
            </label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              name="tagsInput"
              value={formData.tagsInput}
              onChange={handleChange}
              placeholder="javascript, es6, let"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>
        </div>

        {/* Content with Markdown Tabs */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Markdown Content <span className="text-red-500">*</span>
            </label>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('write')}
                className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold transition gap-1 ${
                  activeTab === 'write'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Write</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold transition gap-1 ${
                  activeTab === 'preview'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview</span>
              </button>
            </div>
          </div>

          {activeTab === 'write' ? (
            <textarea
              name="content"
              rows="12"
              value={formData.content}
              onChange={handleChange}
              placeholder="# Markdown Heading&#10;&#10;Explain concepts, write code blocks with ```javascript ... ```, and lists."
              required
              className="w-full p-4 rounded-xl border border-slate-200 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition leading-relaxed bg-slate-50/50"
            />
          ) : (
            <div className="p-6 rounded-2xl border border-slate-200 bg-white min-h-[300px]">
              <MarkdownRenderer content={formData.content || '*Nothing to preview*'} />
            </div>
          )}
        </div>

        {/* Published Checkbox */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="published"
            name="published"
            checked={formData.published}
            onChange={handleChange}
            className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
          />
          <label htmlFor="published" className="text-xs font-semibold text-slate-700 cursor-pointer">
            Publish this note (visible to students)
          </label>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Link
            to="/admin/notes"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={actionLoading}
            className="inline-flex items-center px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition disabled:opacity-50 gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{actionLoading ? 'Saving Changes...' : 'Update Note'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
