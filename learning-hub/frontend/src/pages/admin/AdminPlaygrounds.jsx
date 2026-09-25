import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchPlaygrounds,
  deletePlayground,
} from '../../features/playgrounds/playgroundSlice';
import { fetchTopics } from '../../features/topics/topicSlice';
import {
  Shield,
  PlusCircle,
  Search,
  Play,
  Edit,
  Trash2,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Check,
  Code2,
  Filter,
} from 'lucide-react';

export default function AdminPlaygrounds() {
  const dispatch = useDispatch();
  const { playgrounds, loading, error } = useSelector((state) => state.playgrounds);
  const { topics } = useSelector((state) => state.topics);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    dispatch(fetchTopics());
    dispatch(fetchPlaygrounds());
  }, [dispatch]);

  const handleDelete = async (id) => {
    try {
      await dispatch(deletePlayground(id)).unwrap();
      setStatusMessage('Playground deleted successfully.');
      setDeleteConfirmId(null);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      alert(`Error deleting playground: ${err}`);
    }
  };

  const filteredPlaygrounds = playgrounds.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(term) ||
      (p.description || '').toLowerCase().includes(term) ||
      (p.slug || '').toLowerCase().includes(term);

    const matchesTopic = selectedTopic ? p.topic?.slug === selectedTopic : true;
    const matchesDiff = selectedDifficulty ? p.difficulty === selectedDifficulty : true;

    return matchesSearch && matchesTopic && matchesDiff;
  });

  const difficultyColors = {
    BEGINNER: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    INTERMEDIATE: 'bg-amber-50 text-amber-700 border-amber-200',
    ADVANCED: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-purple-700 font-semibold mb-1">
            <Shield className="w-4 h-4" />
            <span>ADMINISTRATOR CONSOLE</span>
            <span>/</span>
            <span className="text-slate-500">PLAYGROUNDS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Interactive Playgrounds Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, configure, and monitor live execution sandboxes and interactive code challenges.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/admin"
            className="inline-flex items-center px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Dashboard
          </Link>
          <Link
            to="/admin/playgrounds/create"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Create Playground
          </Link>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search playgrounds..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Topic Filter */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Topics</option>
              {topics &&
                topics.map((t) => (
                  <option key={t.id} value={t.slug}>
                    {t.title}
                  </option>
                ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Difficulties</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>

          <button
            onClick={() => dispatch(fetchPlaygrounds())}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Playgrounds Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Playground</th>
                <th className="px-6 py-4">Topic Lineage</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-purple-500" />
                    Loading interactive playgrounds...
                  </td>
                </tr>
              ) : filteredPlaygrounds.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <Terminal className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No playgrounds match your filters.
                  </td>
                </tr>
              ) : (
                filteredPlaygrounds.map((pg) => {
                  const isConfirming = deleteConfirmId === pg.id;
                  const diffBadge =
                    difficultyColors[pg.difficulty] || difficultyColors.BEGINNER;

                  return (
                    <tr key={pg.id} className="hover:bg-slate-50/80 transition">
                      {/* Title & Slug */}
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <Link
                            to={`/playgrounds/${pg.slug}`}
                            className="font-bold text-slate-900 hover:text-purple-600 transition flex items-center gap-1.5"
                          >
                            <span>{pg.title}</span>
                          </Link>
                          <div className="text-[11px] font-mono text-slate-400">
                            /playgrounds/{pg.slug}
                          </div>
                        </div>
                      </td>

                      {/* Topic Lineage */}
                      <td className="px-6 py-4">
                        {pg.topic ? (
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-800">
                              {pg.topic.title}
                            </span>
                            {pg.topic.section && (
                              <div className="text-[10px] text-slate-400">
                                {pg.topic.section.title}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Difficulty & Language */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${diffBadge}`}
                          >
                            {pg.difficulty || 'BEGINNER'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 uppercase">
                            {pg.language}
                          </span>
                        </div>
                      </td>

                      {/* Published Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            pg.published
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {pg.published ? 'Published' : 'Draft'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/playgrounds/${pg.slug}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition"
                            title="Launch Playground"
                          >
                            <Play className="w-4 h-4 fill-current" />
                          </Link>

                          <Link
                            to={`/admin/playgrounds/${pg.id}/edit`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-slate-100 transition"
                            title="Edit Playground"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {isConfirming ? (
                            <div className="flex items-center space-x-1 bg-red-50 p-1 rounded-lg border border-red-200">
                              <button
                                onClick={() => handleDelete(pg.id)}
                                className="px-2 py-0.5 bg-red-600 text-white rounded font-bold text-[10px] hover:bg-red-700"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded font-bold text-[10px] hover:bg-slate-300"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(pg.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 transition"
                              title="Delete Playground"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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
    </div>
  );
}
