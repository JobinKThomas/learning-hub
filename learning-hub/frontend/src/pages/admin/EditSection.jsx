import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  fetchSectionById,
  updateSection,
  clearCurrentSection,
} from '../../features/sections/sectionSlice';
import { fetchModules } from '../../features/modules/moduleSlice';
import {
  ArrowLeft,
  Save,
  BookOpen,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Layers,
  Eye,
  Edit3,
} from 'lucide-react';
import TopicContentReader from '../../components/TopicContentReader';

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function EditSection() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { modules } = useSelector((state) => state.modules);
  const { currentSection: section, detailsLoading, actionLoading, error } = useSelector(
    (state) => state.sections
  );

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    module: '',
    description: '',
    duration: '45 mins',
    order: 1,
    itemsInput: '',
    content: '',
    published: true,
  });

  const [formError, setFormError] = useState(null);
  const [activeContentTab, setActiveContentTab] = useState('write');

  useEffect(() => {
    dispatch(fetchModules());
    if (id) {
      dispatch(fetchSectionById(id));
    }
    return () => {
      dispatch(clearCurrentSection());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (section) {
      setFormData({
        title: section.title || '',
        slug: section.slug || '',
        module: section.moduleId || section.module?.id || '',
        description: section.description || '',
        duration: section.duration || '45 mins',
        order: section.order ?? 1,
        itemsInput: Array.isArray(section.items) ? section.items.join(', ') : '',
        content: section.content || '',
        published: section.published !== false,
      });
    }
  }, [section]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError('Section title is required.');
      return;
    }

    if (!formData.module) {
      setFormError('Please select a parent module.');
      return;
    }

    if (!formData.description.trim()) {
      setFormError('Section description is required.');
      return;
    }

    const items = formData.itemsInput
      ? formData.itemsInput
          .split(',')
          .map((i) => i.trim())
          .filter(Boolean)
      : [];

    const payload = {
      title: formData.title.trim(),
      slug: slugify(formData.slug || formData.title),
      module: formData.module,
      description: formData.description.trim(),
      duration: formData.duration.trim() || '45 mins',
      order: Number(formData.order) || 1,
      items,
      content: formData.content.trim(),
      published: formData.published,
    };

    try {
      await dispatch(updateSection({ id, data: payload })).unwrap();
      navigate('/admin/sections');
    } catch (err) {
      setFormError(err || 'Failed to update section');
    }
  };

  if (detailsLoading && !section) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-600" />
        <p className="text-sm font-medium">Loading section details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/sections"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-purple-700 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Sections Management
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-semibold border border-purple-400/30">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>Section Editor</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Edit: {formData.title || 'Section'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Update section sub-lessons, topic checklists, notes, and publishing status.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {(formError || error) && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{formError || error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="space-y-5">
          {/* Parent Module Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Parent Module *
            </label>
            <select
              name="module"
              required
              value={formData.module}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">-- Select a Parent Module --</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} {m.learningPath?.title ? `(${m.learningPath.title})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Section Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                name="slug"
                required
                value={formData.slug}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Duration */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Duration
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Order */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sequential Order Number
              </label>
              <input
                type="number"
                name="order"
                min="1"
                max="100"
                value={formData.order}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              required
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Items / Sub-lessons Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sub-lessons / Topics (comma-separated)
            </label>
            <input
              type="text"
              name="itemsInput"
              value={formData.itemsInput}
              onChange={handleChange}
              placeholder="var, let, const"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Content Notes with Tabs */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Lesson Content & Code Guide
              </label>

              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveContentTab('write')}
                  className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold transition gap-1 ${
                    activeContentTab === 'write'
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Write</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveContentTab('preview')}
                  className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold transition gap-1 ${
                    activeContentTab === 'preview'
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Preview</span>
                </button>
              </div>
            </div>

            {activeContentTab === 'write' ? (
              <textarea
                name="content"
                rows="8"
                value={formData.content}
                onChange={handleChange}
                placeholder="# Markdown or plain text lesson explanation..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            ) : (
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50/50">
                <TopicContentReader
                  content={formData.content || '*No content entered yet.*'}
                  title="Lesson Notes & Code Reference"
                />
              </div>
            )}
          </div>

          {/* Published */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="published"
              name="published"
              checked={formData.published}
              onChange={handleChange}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
            />
            <label htmlFor="published" className="text-xs font-semibold text-slate-700">
              Published (visible to all students)
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Link
            to="/admin/sections"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={actionLoading}
            className="inline-flex items-center px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-200 transition"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {actionLoading ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
