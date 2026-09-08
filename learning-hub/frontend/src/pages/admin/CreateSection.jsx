import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { createSection } from '../../features/sections/sectionSlice';
import { fetchModules } from '../../features/modules/moduleSlice';
import {
  ArrowLeft,
  PlusCircle,
  Save,
  BookOpen,
  Sparkles,
  AlertCircle,
  Layers,
} from 'lucide-react';

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function CreateSection() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedModule = searchParams.get('module');

  const { modules } = useSelector((state) => state.modules);
  const { actionLoading, error } = useSelector((state) => state.sections);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    module: preselectedModule || '',
    description: '',
    duration: '',
    order: 1,
    itemsInput: '',
    content: '',
    published: true,
  });

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    dispatch(fetchModules());
  }, [dispatch]);

  // If modules load and no module is selected yet, select matching or first
  useEffect(() => {
    if (modules && modules.length > 0 && !formData.module) {
      if (preselectedModule) {
        const found = modules.find(
          (m) => m.slug === preselectedModule || m.id === preselectedModule
        );
        if (found) {
          setFormData((prev) => ({ ...prev, module: found.id }));
        }
      } else {
        setFormData((prev) => ({ ...prev, module: modules[0].id }));
      }
    }
  }, [modules, preselectedModule, formData.module]);

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: slugManuallyEdited ? prev.slug : slugify(val),
    }));
  };

  const handleSlugChange = (e) => {
    setSlugManuallyEdited(true);
    setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }));
  };

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
      await dispatch(createSection(payload)).unwrap();
      navigate('/admin/sections');
    } catch (err) {
      setFormError(err || 'Failed to create section');
    }
  };

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
            <PlusCircle className="w-3.5 h-3.5 text-purple-300" />
            <span>Curriculum Section Creator</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Create Section & Lessons
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Add detailed curriculum topics (e.g., var, let, const) and lesson guides under a module.
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
                onChange={handleTitleChange}
                placeholder="e.g., Variables"
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
                onChange={handleSlugChange}
                placeholder="e.g., variables"
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
                placeholder="e.g., 45 mins"
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
              placeholder="What will learners understand in this section?"
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
            <span className="text-[11px] text-slate-400">
              Enter specific concepts separated by commas (e.g. <code>var, let, const</code>).
            </span>
          </div>

          {/* Content Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lesson Content & Code Guide
            </label>
            <textarea
              name="content"
              rows="6"
              value={formData.content}
              onChange={handleChange}
              placeholder="# Markdown or plain text lesson explanation..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
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
              Publish immediately (visible to all students)
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
            {actionLoading ? 'Saving...' : 'Create Section'}
          </button>
        </div>
      </form>
    </div>
  );
}
