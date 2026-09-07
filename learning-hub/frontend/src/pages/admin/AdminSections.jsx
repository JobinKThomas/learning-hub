import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchSections,
  deleteSection,
  clearSectionActionState,
} from '../../features/sections/sectionSlice';
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

export default function AdminSections() {
  const dispatch = useDispatch();
  const { sections, loading, actionLoading, error, actionSuccess } = useSelector(
    (state) => state.sections
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    dispatch(fetchSections());
    return () => {
      dispatch(clearSectionActionState());
    };
  }, [dispatch]);

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteSection(id)).unwrap();
      setStatusMessage('Section deleted successfully.');
      setDeleteConfirmId(null);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      alert(`Error deleting section: ${err}`);
    }
  };

  const filteredSections = sections.filter((s) => {
    const term = searchTerm.toLowerCase();
    const moduleTitle = s.module?.title?.toLowerCase() || '';
    const pathTitle = s.module?.learningPath?.title?.toLowerCase() || '';
    const itemsStr = (s.items || []).join(' ').toLowerCase();
    return (
      s.title.toLowerCase().includes(term) ||
      s.slug.toLowerCase().includes(term) ||
      moduleTitle.includes(term) ||
      pathTitle.includes(term) ||
      itemsStr.includes(term)
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
            to="/admin/modules"
            className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-purple-700 transition"
          >
            <BookOpen className="w-4 h-4 mr-1.5 text-purple-600" />
            Manage Modules
          </Link>
          <Link
            to="/admin/learning-paths"
            className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-purple-700 transition"
          >
            <Layers className="w-4 h-4 mr-1.5 text-purple-600" />
            Manage Paths
          </Link>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-semibold border border-purple-400/30">
            <Layers className="w-3.5 h-3.5 text-purple-300" />
            <span>Curriculum Sections & Sub-lessons</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Sections Administration
          </h1>
          <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
            Create, reorder, and manage fine-grained curriculum sections and topic checklists (var, let, const, etc.).
          </p>
        </div>

        <Link
          to="/admin/sections/create"
          className="inline-flex items-center px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-md shadow-purple-600/30 transition"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Create New Section
        </Link>
      </div>

      {/* Status Notification */}
      {statusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Sections Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Search & Actions Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by title, slug, module, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>
              Total sections: <strong className="text-slate-900 font-bold">{sections.length}</strong>
            </span>
            <button
              onClick={() => dispatch(fetchSections())}
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
                <th className="py-3.5 px-5">Section Title & Slug</th>
                <th className="py-3.5 px-4">Parent Module</th>
                <th className="py-3.5 px-4 text-center">Order</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Sub-lessons / Topics</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading && sections.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
                    <span>Loading sections...</span>
                  </td>
                </tr>
              ) : filteredSections.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    No sections found matching "{searchTerm}".
                  </td>
                </tr>
              ) : (
                filteredSections.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900">{s.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono">/{s.slug}</div>
                    </td>
                    <td className="py-4 px-4">
                      {s.module ? (
                        <div>
                          <Link
                            to={`/modules/${s.module.slug}`}
                            className="font-medium text-indigo-600 hover:text-indigo-800"
                          >
                            {s.module.title}
                          </Link>
                          {s.module.learningPath && (
                            <div className="text-[10px] text-slate-400">
                              {s.module.learningPath.title}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">Unlinked</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-slate-700">
                      {s.order ?? 1}
                    </td>
                    <td className="py-4 px-4 text-slate-700">{s.duration || '45 mins'}</td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap items-center gap-1">
                        {s.items && s.items.length > 0 ? (
                          s.items.map((item, iIdx) => (
                            <span
                              key={iIdx}
                              className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px]"
                            >
                              {item}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {s.published !== false ? (
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
                          to={`/sections/${s.slug}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition"
                          title="Preview Section"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/admin/sections/${s.id}/edit`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition"
                          title="Edit Section"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirmId(s.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete Section"
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
            <h3 className="text-lg font-bold text-slate-900">Delete Section?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete this section? This action cannot be undone and will remove
              all its topic checklists and curriculum tracking.
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
