import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { createLearningPath } from '../../features/learningPaths/learningPathSlice';
import {
  ArrowLeft,
  PlusCircle,
  Trash2,
  Save,
  Layers,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

const CATEGORIES = ['Frontend', 'Backend', 'Full Stack', 'Mobile', 'DevOps', 'Cloud & Architecture'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const ICONS = ['Code', 'FileCode', 'Layers', 'Server', 'Terminal', 'BookOpen', 'Cpu'];
const COLORS = ['indigo', 'amber', 'emerald', 'purple', 'blue'];

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function CreateLearningPath() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { actionLoading, error } = useSelector((state) => state.learningPaths);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    category: 'Frontend',
    level: 'Beginner',
    estimatedHours: 20,
    icon: 'Code',
    color: 'indigo',
    published: true,
  });

  const [modules, setModules] = useState([]);

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [formError, setFormError] = useState(null);

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

  // Module builders
  const handleAddModule = () => {
    setModules((prev) => [
      ...prev,
      {
        title: `Module ${prev.length + 1}`,
        description: '',
        duration: '3 hours',
        topicsInput: '',
      },
    ]);
  };

  const handleModuleChange = (index, field, value) => {
    setModules((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleRemoveModule = (index) => {
    setModules((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError('Please provide a learning path title.');
      return;
    }

    if (!formData.description.trim()) {
      setFormError('Please provide a description.');
      return;
    }

    // Process modules
    const formattedModules = modules.map((m, idx) => {
      const topics = m.topicsInput
        ? m.topicsInput
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [];
      return {
        title: m.title.trim() || `Module ${idx + 1}`,
        description: m.description.trim(),
        duration: m.duration.trim() || '2 hours',
        topics,
        order: idx + 1,
      };
    });

    const payload = {
      ...formData,
      estimatedHours: Number(formData.estimatedHours) || 20,
      modules: formattedModules,
    };

    try {
      await dispatch(createLearningPath(payload)).unwrap();
      navigate('/admin/learning-paths');
    } catch (err) {
      setFormError(err || 'Failed to create learning path');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/learning-paths"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-purple-700 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Learning Paths Management
        </Link>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-semibold border border-purple-400/30">
            <PlusCircle className="w-3.5 h-3.5 text-purple-300" />
            <span>Curriculum Builder</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Create New Learning Path
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Configure metadata, levels, and structure sequential curriculum modules with topics.
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
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Path Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="e.g., Full Stack TypeScript Masterclass"
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
                placeholder="e.g., full-stack-typescript"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Difficulty Level
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            {/* Estimated Hours */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                name="estimatedHours"
                min="1"
                max="500"
                value={formData.estimatedHours}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Icon & Color */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Icon
                </label>
                <select
                  name="icon"
                  value={formData.icon}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {ICONS.map((ic) => (
                    <option key={ic} value={ic}>
                      {ic}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Accent Color
                </label>
                <select
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {COLORS.map((col) => (
                    <option key={col} value={col}>
                      {col.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
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
              placeholder="Provide a comprehensive summary of what learners will accomplish in this path..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Published Toggle */}
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

        {/* Section 2: Modules & Topics Builder */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                Curriculum Modules ({modules.length})
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Define the step-by-step milestones and lessons for this track.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddModule}
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold hover:bg-purple-100 transition"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1" />
              Add Module
            </button>
          </div>

          <div className="space-y-4">
            {modules.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">
                <p className="text-xs text-slate-500">No modules added yet. You can add modules now or create them later.</p>
                <button
                  type="button"
                  onClick={handleAddModule}
                  className="mt-2 inline-flex items-center px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold hover:bg-purple-100 transition"
                >
                  <PlusCircle className="w-3.5 h-3.5 mr-1" />
                  Add Module
                </button>
              </div>
            ) : (
              modules.map((mod, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full">
                      Module {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveModule(index)}
                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Remove Module"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Module Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={mod.title}
                      onChange={(e) => handleModuleChange(index, 'title', e.target.value)}
                      placeholder="e.g., Deep Dive into Asynchronous Patterns"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={mod.duration}
                      onChange={(e) => handleModuleChange(index, 'duration', e.target.value)}
                      placeholder="e.g., 5 hours"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={mod.description}
                    onChange={(e) => handleModuleChange(index, 'description', e.target.value)}
                    placeholder="e.g., Learn callbacks, Promises, async/await, and event loops."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Topics / Lessons (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={mod.topicsInput}
                    onChange={(e) => handleModuleChange(index, 'topicsInput', e.target.value)}
                    placeholder="e.g., Event Loop, Promises & Chaining, Async/Await"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>
            )))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/admin/learning-paths"
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
            {actionLoading ? 'Saving...' : 'Create Learning Path'}
          </button>
        </div>
      </form>
    </div>
  );
}
