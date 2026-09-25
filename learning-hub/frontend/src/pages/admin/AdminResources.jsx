import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchResources,
  deleteResource,
  clearResourceActionState,
} from '../../features/resources/resourceSlice';
import { fetchTopics } from '../../features/topics/topicSlice';
import { getResourceTypeMeta } from '../../features/resources/components/ResourceCard';
import {
  Shield,
  PlusCircle,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Check,
  Layers,
  Code2,
  Filter,
  Globe,
} from 'lucide-react';

export default function AdminResources() {
  const dispatch = useDispatch();
  const { resources, loading, actionLoading, error } = useSelector(
    (state) => state.resources
  );
  const { topics } = useSelector((state) => state.topics);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    dispatch(fetchTopics());
    dispatch(fetchResources());
    return () => {
      dispatch(clearResourceActionState());
    };
  }, [dispatch]);

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteResource(id)).unwrap();
      setStatusMessage('Resource deleted successfully.');
      setDeleteConfirmId(null);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      alert(`Error deleting resource: ${err}`);
    }
  };

  const filteredResources = resources.filter((r) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      r.title.toLowerCase().includes(term) ||
      (r.description || '').toLowerCase().includes(term) ||
      (r.author || '').toLowerCase().includes(term) ||
      r.url.toLowerCase().includes(term);

    const matchesTopic = selectedTopic ? r.topic?.slug === selectedTopic : true;
    const matchesType = selectedType ? r.type === selectedType : true;

    return matchesSearch && matchesTopic && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-purple-700 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Admin Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/topics"
            className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-purple-700 transition"
          >
            <Code2 className="w-4 h-4 mr-1.5 text-purple-600" />
            Manage Topics
          </Link>
          <Link
            to="/admin/notes"
            className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-purple-700 transition"
          >
            <BookOpen className="w-4 h-4 mr-1.5 text-purple-600" />
            Manage Notes
          </Link>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-semibold border border-purple-400/30">
            <Globe className="w-3.5 h-3.5 text-purple-300" />
            <span>Phase 8 External Resources</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Resources Administration
          </h1>
          <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
            Curate and manage documentation links, video tutorials, articles, and GitHub repositories linked to topics.
          </p>
        </div>

        <Link
          to="/admin/resources/create"
          className="inline-flex items-center px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-md shadow-purple-600/30 transition"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Create New Resource
        </Link>
      </div>

      {/* Status Notification */}
      {statusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Resources Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by title, author, or URL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>

            {/* Topic Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full sm:w-48 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              >
                <option value="">All Topics</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.slug}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full sm:w-44 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            >
              <option value="">All Resource Types</option>
              <option value="DOCUMENTATION">📚 Documentation</option>
              <option value="VIDEO">🎥 Video</option>
              <option value="ARTICLE">🔗 Article</option>
              <option value="GITHUB">💻 GitHub</option>
              <option value="COURSE">🎓 Course</option>
              <option value="TOOL">🛠️ Tool</option>
            </select>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>
              Total resources: <strong className="text-slate-900 font-bold">{resources.length}</strong>
            </span>
            <button
              onClick={() => dispatch(fetchResources())}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-5">Resource Title & Link</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Topic</th>
                <th className="py-3.5 px-4">Author / Platform</th>
                <th className="py-3.5 px-4 text-center">Order</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading && resources.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
                    <span>Loading resources...</span>
                  </td>
                </tr>
              ) : filteredResources.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    No resources found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredResources.map((r) => {
                  const meta = getResourceTypeMeta(r.type);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 font-sans flex items-center gap-1.5">
                          <span>{r.title}</span>
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-indigo-600"
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-sm">
                          {r.url}
                        </div>
                        {r.description && (
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {r.description}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${meta.badgeClass}`}
                        >
                          <span>{meta.emoji}</span>
                          <span>{meta.label}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {r.topic ? (
                          <Link
                            to={`/topics/${r.topic.slug}`}
                            className="font-medium text-indigo-600 hover:text-indigo-800"
                          >
                            {r.topic.title}
                          </Link>
                        ) : (
                          <span className="text-slate-400">Unlinked</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-slate-600 font-medium">
                        {r.author || '—'}
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-slate-700">
                        {r.order ?? 1}
                      </td>
                      <td className="py-4 px-4">
                        {r.published !== false ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition"
                            title="Visit Resource"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <Link
                            to={`/admin/resources/${r.id}/edit`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition"
                            title="Edit Resource"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteConfirmId(r.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                            title="Delete Resource"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Delete Resource?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete this resource? Students will no longer see this reference.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm"
              >
                {actionLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
