import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  fetchLearningPaths,
  deleteLearningPath,
  clearActionState,
} from '../../features/learningPaths/learningPathSlice';
import Pagination from '../../components/Pagination';
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
  Filter,
  ArrowUpDown,
  X,
} from 'lucide-react';

const CATEGORIES = ['All', 'Frontend', 'Backend', 'Full Stack', 'Mobile', 'DevOps'];
const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const STATUSES = ['All', 'Published', 'Draft'];
const SORT_OPTIONS = [
  { label: 'Newest First', value: 'createdAt', order: 'desc' },
  { label: 'Oldest First', value: 'createdAt', order: 'asc' },
  { label: 'Title (A–Z)', value: 'title', order: 'asc' },
  { label: 'Title (Z–A)', value: 'title', order: 'desc' },
];

export default function AdminLearningPaths() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { paths, count, loading, actionLoading, error, actionSuccess, pagination } = useSelector(
    (state) => state.learningPaths
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSort, setSelectedSort] = useState('createdAt-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  const loadData = (page = currentPage) => {
    const [sort, order] = selectedSort.split('-');
    dispatch(
      fetchLearningPaths({
        search: searchTerm.trim() || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        difficulty: selectedDifficulty !== 'All' ? selectedDifficulty : undefined,
        status: selectedStatus !== 'All' ? selectedStatus.toLowerCase() : undefined,
        sort: sort || 'createdAt',
        order: order || 'desc',
        page,
        limit: 8,
      })
    );
  };

  useEffect(() => {
    loadData(currentPage);
    return () => {
      dispatch(clearActionState());
    };
  }, [dispatch, selectedCategory, selectedDifficulty, selectedStatus, selectedSort, currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadData(1);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    const [sort, order] = selectedSort.split('-');
    dispatch(
      fetchLearningPaths({
        search: undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        difficulty: selectedDifficulty !== 'All' ? selectedDifficulty : undefined,
        status: selectedStatus !== 'All' ? selectedStatus.toLowerCase() : undefined,
        sort,
        order,
        page: 1,
        limit: 8,
      })
    );
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteLearningPath(id)).unwrap();
      setStatusMessage('Learning path deleted successfully.');
      setDeleteConfirmId(null);
      setTimeout(() => setStatusMessage(null), 3000);
      loadData(currentPage);
    } catch (err) {
      alert(`Error deleting path: ${err}`);
    }
  };

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
        <Link
          to="/learning-paths"
          className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
        >
          <Eye className="w-4 h-4 mr-1.5" />
          View as Learner
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-semibold border border-purple-400/30">
            <Shield className="w-3.5 h-3.5 text-purple-300" />
            <span>Curriculum Management</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Learning Paths Administration
          </h1>
          <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
            Create, update, and manage curricula, modules, and learning tracks across the platform.
          </p>
        </div>

        <Link
          to="/admin/learning-paths/create"
          className="inline-flex items-center px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-md shadow-purple-600/30 transition gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Learning Path</span>
        </Link>
      </div>

      {/* Success Notification */}
      {statusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="lg:col-span-4 relative flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search: JavaScript, Python..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-16 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition"
            >
              Go
            </button>
          </form>

          {/* Status Filter */}
          <div className="lg:col-span-2 flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st === 'All' ? 'All Statuses' : st}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="lg:col-span-3 flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500">Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Difficulties' : d}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="lg:col-span-3 flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort:
            </span>
            <select
              value={selectedSort}
              onChange={(e) => {
                setSelectedSort(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={`${opt.value}-${opt.order}`} value={`${opt.value}-${opt.order}`}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Action Table & Search Results */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Table Header Controls */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-900 font-bold">{paths.length}</strong> of{' '}
            <strong className="text-slate-900 font-bold">{pagination?.total ?? count}</strong> paths
          </div>
          <button
            onClick={() => loadData(currentPage)}
            className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 font-bold"
            title="Refresh Table"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Paths Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-5">Title & Slug</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Level</th>
                <th className="py-3.5 px-4">Modules</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading && paths.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
                    <span>Loading paths...</span>
                  </td>
                </tr>
              ) : paths.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    No learning paths found matching filter criteria.
                  </td>
                </tr>
              ) : (
                paths.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900">{p.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono">/{p.slug}</div>
                    </td>
                    <td className="py-4 px-4 text-slate-700">{p.category}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          p.level === 'Beginner'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : p.level === 'Intermediate'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}
                      >
                        {p.level}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-700 font-semibold">
                      {p.modulesCount || (p.modules ? p.modules.length : 0)}
                    </td>
                    <td className="py-4 px-4 text-slate-700">{p.estimatedHours}h</td>
                    <td className="py-4 px-4">
                      {p.published !== false ? (
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
                          to={`/learning-paths/${p.slug}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition"
                          title="Preview Learner View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/admin/learning-paths/${p.id}/edit`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition"
                          title="Edit Path"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete Path"
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

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-100">
          <Pagination
            currentPage={pagination?.page || currentPage}
            totalPages={pagination?.totalPages || 1}
            onPageChange={handlePageChange}
            hasNextPage={pagination?.hasNextPage}
            hasPrevPage={pagination?.hasPrevPage}
            totalItems={pagination?.total || count}
            itemsPerPage={pagination?.limit || 8}
            itemName="learning paths"
            colorScheme="purple"
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Delete Learning Path?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete this learning path? This action is permanent and will
              remove the curriculum, all modules, and topics.
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
