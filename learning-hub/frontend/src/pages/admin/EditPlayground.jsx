import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  fetchPlaygroundById,
  updatePlayground,
} from '../../features/playgrounds/playgroundSlice';
import { fetchTopics } from '../../features/topics/topicSlice';
import {
  Shield,
  ArrowLeft,
  Save,
  Terminal,
  Sparkles,
  AlertCircle,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';

export default function EditPlayground() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { topics } = useSelector((state) => state.topics);
  const { currentPlayground: playground, detailsLoading: fetching } = useSelector(
    (state) => state.playgrounds
  );

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    topic: '',
    description: '',
    instructions: '',
    initialCode: '',
    solutionCode: '',
    expectedOutput: '',
    hintsText: '',
    language: 'javascript',
    difficulty: 'BEGINNER',
    order: 0,
    published: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    dispatch(fetchTopics());
    if (id) {
      dispatch(fetchPlaygroundById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (playground) {
      setFormData({
        title: playground.title || '',
        slug: playground.slug || '',
        topic: playground.topic?.id || playground.topic?._id || '',
        description: playground.description || '',
        instructions: playground.instructions || '',
        initialCode: playground.initialCode || '',
        solutionCode: playground.solutionCode || '',
        expectedOutput: playground.expectedOutput || '',
        hintsText: Array.isArray(playground.hints) ? playground.hints.join('\n') : '',
        language: playground.language || 'javascript',
        difficulty: playground.difficulty || 'BEGINNER',
        order: playground.order ?? 0,
        published: playground.published ?? true,
      });
    }
  }, [playground]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const hints = formData.hintsText
        ? formData.hintsText
            .split('\n')
            .map((h) => h.trim())
            .filter(Boolean)
        : [];

      const payload = {
        title: formData.title,
        slug: formData.slug || undefined,
        topic: formData.topic,
        description: formData.description,
        instructions: formData.instructions,
        initialCode: formData.initialCode,
        solutionCode: formData.solutionCode,
        expectedOutput: formData.expectedOutput,
        hints,
        language: formData.language,
        difficulty: formData.difficulty,
        order: Number(formData.order) || 0,
        published: formData.published,
      };

      await dispatch(updatePlayground({ id, data: payload })).unwrap();
      navigate('/admin/playgrounds');
    } catch (err) {
      setError(err || 'Failed to update playground');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-600" />
        Loading playground configuration...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-purple-700 font-semibold mb-1">
            <Shield className="w-4 h-4" />
            <span>ADMINISTRATOR CONSOLE</span>
            <span>/</span>
            <Link to="/admin/playgrounds" className="hover:underline">
              PLAYGROUNDS
            </Link>
            <span>/</span>
            <span className="text-slate-500">EDIT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Edit Playground: {playground?.title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Update instructions, starter code, difficulty, or target output.
          </p>
        </div>

        <Link
          to="/admin/playgrounds"
          className="inline-flex items-center px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Cancel
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-600" />
            <span>Playground Settings</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Topic Selection */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Target Topic *</label>
              <select
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
              >
                <option value="">Select a Topic</option>
                {topics &&
                  topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.slug})
                    </option>
                  ))}
              </select>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Playground Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Slug</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
              />
            </div>

            {/* Difficulty */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Difficulty Level</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>

            {/* Language */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Language</label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
              >
                <option value="javascript">JavaScript (Node.js Sandbox)</option>
                <option value="cpp">C++</option>
                <option value="python">Python</option>
                <option value="typescript">TypeScript</option>
              </select>
            </div>

            {/* Description */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Summary Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
              />
            </div>

            {/* Challenge Instructions */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Challenge Instructions (Markdown)</label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                rows={4}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
              />
            </div>

            {/* Starter Code */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Starter Code *</label>
              <textarea
                name="initialCode"
                value={formData.initialCode}
                onChange={handleChange}
                rows={6}
                required
                className="w-full p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition whitespace-pre"
              />
            </div>

            {/* Expected Output */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Target / Expected Output</span>
              </label>
              <textarea
                name="expectedOutput"
                value={formData.expectedOutput}
                onChange={handleChange}
                rows={2}
                className="w-full p-3 bg-slate-900 text-emerald-300 font-mono text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition whitespace-pre"
              />
            </div>

            {/* Hints */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                <span>Hints (One hint per line)</span>
              </label>
              <textarea
                name="hintsText"
                value={formData.hintsText}
                onChange={handleChange}
                rows={3}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
              />
            </div>

            {/* Order & Published Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Display Order</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
              />
            </div>

            <div className="flex items-center space-x-3 pt-6">
              <input
                type="checkbox"
                id="published"
                name="published"
                checked={formData.published}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="published" className="text-xs font-bold text-slate-700 cursor-pointer">
                Publish Playground immediately
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-3">
          <Link
            to="/admin/playgrounds"
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
