import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchTopics,
  deleteTopic,
  clearTopicActionState,
} from '../../features/topics/topicSlice';
import {
  Shield,
  PlusCircle,
  Search,
  Eye,
  Edit,
  Trash2,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Check,
  Layers,
  Code2,
} from 'lucide-react';

export default function AdminTopics() {
  const dispatch = useDispatch();
  const { topics, loading, actionLoading, error, actionSuccess } = useSelector(
    (state) => state.topics
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    dispatch(fetchTopics());
    return () => {
      dispatch(clearTopicActionState());
    };
  }, [dispatch]);

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteTopic(id)).unwrap();
      setStatusMessage('Topic deleted successfully.');
      setDeleteConfirmId(null);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      alert(`Error deleting topic: ${err}`);
    }
  };

  const filteredTopics = topics.filter((t) => {
    const term = searchTerm.toLowerCase();
    const sectionTitle = t.section?.title?.toLowerCase() || '';
    const moduleTitle = t.section?.module?.title?.toLowerCase() || '';
    const summary = (t.summary || '').toLowerCase();
    return (
      t.title.toLowerCase().includes(term) ||
      t.slug.toLowerCase().includes(term) ||
      sectionTitle.includes(term) ||
      moduleTitle.includes(term) ||
      summary.includes(term)
    );
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
            to="/admin/sections"
            className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-purple-700 transition"
          >
            <Layers className="w-4 h-4 mr-1.5 text-purple-600" />
            Manage Sections
          </Link>
          <Link
            to="/admin/modules"
            className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-purple-700 transition"
          >
            <BookOpen className="w-4 h-4 mr-1.5 text-purple-600" />
            Manage Modules
          </Link>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-semibold border border-purple-400/30">
            <Code2 className="w-3.5 h-3.5 text-purple-300" />
            <span>Curriculum Topics & Lessons</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Topics Administration
          </h1>
          <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
            Create, reorganize, and manage individual coding topics, interactive examples, and syntax guides.
          </p>
        </div>

        <Link
          to="/admin/topics/create"
          className="inline-flex items-center px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-md shadow-purple-600/30 transition"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Create New Topic
        </Link>
      </div>

      {/* Status Notification */}
      {statusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Topics Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Search & Actions Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by title, slug, section, or module..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>
              Total topics: <strong className="text-slate-900 font-bold">{topics.length}</strong>
            </span>
            <button
              onClick={() => dispatch(fetchTopics())}
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
                <th className="py-3.5 px-5">Topic Title & Slug</th>
                <th className="py-3.5 px-4">Parent Section</th>
                <th className="py-3.5 px-4 text-center">Order</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4 text-center">Code Examples</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading && topics.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
                    <span>Loading topics...</span>
                  </td>
                </tr>
              ) : filteredTopics.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    No topics found matching "{searchTerm}".
                  </td>
                </tr>
              ) : (
                filteredTopics.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900 font-mono">{t.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono">/{t.slug}</div>
                      {t.summary && (
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {t.summary}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {t.section ? (
                        <div>
                          <Link
                            to={`/sections/${t.section.slug}`}
                            className="font-medium text-indigo-600 hover:text-indigo-800"
                          >
                            {t.section.title}
                          </Link>
                          {t.section.module && (
                            <div className="text-[10px] text-slate-400">
                              {t.section.module.title}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">Unlinked</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-slate-700">
                      {t.order ?? 1}
                    </td>
                    <td className="py-4 px-4 text-slate-700">{t.duration || '15 mins'}</td>
                    <td className="py-4 px-4 text-center font-semibold text-slate-700">
                      {t.codeExamplesCount || (t.codeExamples ? t.codeExamples.length : 0)}
                    </td>
                    <td className="py-4 px-4">
                      {t.published !== false ? (
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
                        <Link
                          to={`/topics/${t.slug}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition"
                          title="Preview Topic"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/admin/topics/${t.id}/edit`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition"
                          title="Edit Topic"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirmId(t.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete Topic"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
            <h3 className="text-lg font-bold text-slate-900">Delete Topic?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete this topic? This action cannot be undone and will remove
              its code examples and concept checklist.
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
