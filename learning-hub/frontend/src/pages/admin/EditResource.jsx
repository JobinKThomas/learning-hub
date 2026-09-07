import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  fetchResourceById,
  updateResource,
  clearCurrentResource,
} from '../../features/resources/resourceSlice';
import { fetchTopics } from '../../features/topics/topicSlice';
import {
  ArrowLeft,
  Save,
  Globe,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export default function EditResource() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { topics } = useSelector((state) => state.topics);
  const { currentResource: resource, detailsLoading, actionLoading, error } = useSelector(
    (state) => state.resources
  );

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    topic: '',
    type: 'DOCUMENTATION',
    description: '',
    author: '',
    order: 1,
    isFree: true,
    published: true,
  });

  const [formError, setFormError] = useState(null);

  useEffect(() => {
    dispatch(fetchTopics());
    if (id) {
      dispatch(fetchResourceById(id));
    }
    return () => {
      dispatch(clearCurrentResource());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (resource) {
      setFormData({
        title: resource.title || '',
        url: resource.url || '',
        topic: resource.topic?.id || resource.topicId || resource.topic?._id || '',
        type: resource.type || 'DOCUMENTATION',
        description: resource.description || '',
        author: resource.author || '',
        order: resource.order ?? 1,
        isFree: resource.isFree !== false,
        published: resource.published !== false,
      });
    }
  }, [resource]);

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
      setFormError('Resource title is required.');
      return;
    }
    if (!formData.url.trim()) {
      setFormError('Resource URL is required.');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      url: formData.url.trim(),
      type: formData.type,
      description: formData.description.trim(),
      author: formData.author.trim(),
      order: Number(formData.order) || 1,
      isFree: formData.isFree,
      published: formData.published,
    };

    if (formData.topic) {
      payload.topic = formData.topic;
    }

    try {
      await dispatch(updateResource({ id, data: payload })).unwrap();
      navigate('/admin/resources');
    } catch (err) {
      setFormError(err || 'Failed to update resource');
    }
  };

  if (detailsLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-600" />
        <p className="text-xs text-slate-500 font-medium">Loading resource for editing...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Navigation Breadcrumb */}
      <Link
        to="/admin/resources"
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-purple-700 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Resources Administration
      </Link>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-semibold border border-purple-400/30">
            <Globe className="w-3.5 h-3.5 text-purple-300" />
            <span>Edit Resource</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {formData.title || 'Edit Resource'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Update external references, links, descriptions, and visibility.
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
        {/* Parent Topic Selection */}
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

        {/* Title & URL */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Resource Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., MDN Web Docs: let statement"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              External URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://developer.mozilla.org/..."
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition pr-10"
              />
              {formData.url && (
                <a
                  href={formData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                  title="Test link"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Resource Type & Author */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Resource Type <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            >
              <option value="DOCUMENTATION">📚 Documentation</option>
              <option value="VIDEO">🎥 Video</option>
              <option value="ARTICLE">🔗 Article</option>
              <option value="GITHUB">💻 GitHub</option>
              <option value="COURSE">🎓 Course</option>
              <option value="TOOL">🛠️ Tool</option>
              <option value="OTHER">🌐 Other</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Author / Platform / Channel
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="e.g., MDN Web Docs, Lydia Hallie"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Description
          </label>
          <textarea
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief explanation of what this resource covers..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
        </div>

        {/* Order & Flags */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-center pt-2">
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

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="isFree"
              name="isFree"
              checked={formData.isFree}
              onChange={handleChange}
              className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="isFree" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Free Resource
            </label>
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="published"
              name="published"
              checked={formData.published}
              onChange={handleChange}
              className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="published" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Published (Visible)
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <Link
            to="/admin/resources"
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
            <span>{actionLoading ? 'Saving...' : 'Update Resource'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
