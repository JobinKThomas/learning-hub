import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  fetchModuleById,
  updateModule,
  clearCurrentModule,
} from '../../features/modules/moduleSlice';
import { fetchLearningPaths } from '../../features/learningPaths/learningPathSlice';
import {
  ArrowLeft,
  Save,
  BookOpen,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function EditModule() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { paths } = useSelector((state) => state.learningPaths);
  const { currentModule: module, detailsLoading, actionLoading, error } = useSelector(
    (state) => state.modules
  );

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    learningPath: '',
    description: '',
    duration: '2 hours',
    order: 1,
    topicsInput: '',
    objectivesInput: '',
    published: true,
  });

  const [formError, setFormError] = useState(null);

  useEffect(() => {
    dispatch(fetchLearningPaths());
    if (id) {
      dispatch(fetchModuleById(id));
    }
    return () => {
      dispatch(clearCurrentModule());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (module) {
      setFormData({
        title: module.title || '',
        slug: module.slug || '',
        learningPath: module.learningPathId || module.learningPath?.id || '',
        description: module.description || '',
        duration: module.duration || '2 hours',
        order: module.order ?? 1,
        topicsInput: Array.isArray(module.topics) ? module.topics.join(', ') : '',
        objectivesInput: Array.isArray(module.learningObjectives)
          ? module.learningObjectives.join(', ')
          : '',
        published: module.published !== false,
      });
    }
  }, [module]);

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
      setFormError('Module title is required.');
      return;
    }

    if (!formData.learningPath) {
      setFormError('Please select a parent learning path.');
      return;
    }

    if (!formData.description.trim()) {
      setFormError('Module description is required.');
      return;
    }

    const topics = formData.topicsInput
      ? formData.topicsInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const objectives = formData.objectivesInput
      ? formData.objectivesInput
          .split(',')
          .map((o) => o.trim())
          .filter(Boolean)
      : [];

    const payload = {
      title: formData.title.trim(),
      slug: slugify(formData.slug || formData.title),
      learningPath: formData.learningPath,
      description: formData.description.trim(),
      duration: formData.duration.trim() || '2 hours',
      order: Number(formData.order) || 1,
      topics,
      learningObjectives: objectives,
      published: formData.published,
    };

    try {
      await dispatch(updateModule({ id, data: payload })).unwrap();
      navigate('/admin/modules');
    } catch (err) {
      setFormError(err || 'Failed to update module');
    }
  };

  if (detailsLoading && !module) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-600" />
        <p className="text-sm font-medium">Loading module details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/modules"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-purple-700 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Modules Management
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-semibold border border-purple-400/30">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>Module Editor</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Edit: {formData.title || 'Module'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Update module lessons, duration, sequence order, and publishing status.
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
          {/* Parent Learning Path Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Parent Learning Path *
            </label>
            <select
              name="learningPath"
              required
              value={formData.learningPath}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">-- Select a Learning Path --</option>
              {paths.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.category} • {p.level})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Module Title *
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

          {/* Topics Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Topics / Lessons (comma-separated)
            </label>
            <textarea
              name="topicsInput"
              rows="2"
              value={formData.topicsInput}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Objectives Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Key Learning Objectives (comma-separated)
            </label>
            <input
              type="text"
              name="objectivesInput"
              value={formData.objectivesInput}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              Published (visible to all students)
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Link
            to="/admin/modules"
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
