import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  fetchLearningPathById,
  updateLearningPath,
  clearCurrentPath,
} from '../../features/learningPaths/learningPathSlice';
import {
  ArrowLeft,
  PlusCircle,
  Trash2,
  Save,
  Layers,
  Sparkles,
  AlertCircle,
  RefreshCw,
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

export default function EditLearningPath() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentPath: path, detailsLoading, actionLoading, error } = useSelector(
    (state) => state.learningPaths
  );

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
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchLearningPathById(id));
    }
    return () => {
      dispatch(clearCurrentPath());
    };
  }, [dispatch, id]);

  // Prepopulate form when path data loads
  useEffect(() => {
    if (path) {
      setFormData({
        title: path.title || '',
        slug: path.slug || '',
        description: path.description || '',
        category: path.category || 'Frontend',
        level: path.level || 'Beginner',
        estimatedHours: path.estimatedHours || 20,
        icon: path.icon || 'Code',
        color: path.color || 'indigo',
        published: path.published !== false,
      });

      if (path.modules && path.modules.length > 0) {
        setModules(
          path.modules.map((m) => ({
            title: m.title || '',
            description: m.description || '',
            duration: m.duration || '2 hours',
            topicsInput: Array.isArray(m.topics) ? m.topics.join(', ') : '',
          }))
        );
      } else {
        setModules([
          {
            title: 'Module 1',
            description: '',
            duration: '2 hours',
            topicsInput: '',
          },
        ]);
      }
    }
  }, [path]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

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
      slug: slugify(formData.slug || formData.title),
      estimatedHours: Number(formData.estimatedHours) || 20,
      modules: formattedModules,
    };

    try {
      await dispatch(updateLearningPath({ id, data: payload })).unwrap();
      navigate('/admin/learning-paths');
    } catch (err) {
      setFormError(err || 'Failed to update learning path');
    }
  };

  if (detailsLoading && !path) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-600" />
        <p className="text-sm font-medium">Loading learning path details...</p>
      </div>
    );
  }

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
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>Path Editor</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Edit: {formData.title || 'Learning Path'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Modify learning track curriculum, modules, lessons, or publication visibility.
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
              Published (visible to learners)
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
                Manage curriculum units and their topics.
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
            {modules.map((mod, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full">
                    Module {index + 1}
                  </span>
                  {modules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveModule(index)}
                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Remove Module"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
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
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>
            ))}
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
            {actionLoading ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
