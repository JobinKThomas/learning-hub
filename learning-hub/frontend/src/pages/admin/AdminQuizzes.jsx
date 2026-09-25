import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchQuizzes, deleteQuiz } from '../../features/quizzes/quizSlice';
import { fetchTopics } from '../../features/topics/topicSlice';
import {
  Shield,
  PlusCircle,
  Search,
  HelpCircle,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Award,
  Clock,
  Play,
  Check,
} from 'lucide-react';

export default function AdminQuizzes() {
  const dispatch = useDispatch();
  const { quizzes, loading, error } = useSelector((state) => state.quizzes);
  const { topics } = useSelector((state) => state.topics);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    dispatch(fetchTopics());
    dispatch(fetchQuizzes());
  }, [dispatch]);

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteQuiz(id)).unwrap();
      setStatusMessage('Quiz deleted successfully.');
      setDeleteConfirmId(null);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      alert(`Error deleting quiz: ${err}`);
    }
  };

  const filteredQuizzes = quizzes.filter((q) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      q.title.toLowerCase().includes(term) ||
      (q.description || '').toLowerCase().includes(term) ||
      (q.slug || '').toLowerCase().includes(term);

    const matchesTopic = selectedTopic ? q.topic?.slug === selectedTopic : true;

    return matchesSearch && matchesTopic;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-purple-700 font-semibold mb-1">
            <Shield className="w-4 h-4" />
            <span>ADMINISTRATOR CONSOLE</span>
            <span>/</span>
            <span className="text-slate-500">QUIZZES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Knowledge Check Quizzes Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, edit, and organize multiple-choice quizzes, scoring criteria, and question banks.
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
            to="/admin/quizzes/create"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold shadow-sm shadow-indigo-200 transition"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Create Quiz
          </Link>
        </div>
      </div>

      {/* Feedback Banner */}
      {statusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Controls Bar: Search & Topic Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search quizzes by title, slug, or description..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Topics</option>
            {topics.map((t) => (
              <option key={t.id} value={t.slug}>
                {t.title}
              </option>
            ))}
          </select>

          <button
            onClick={() => dispatch(fetchQuizzes())}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quizzes Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading && quizzes.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Loading quizzes...</p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Quizzes Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm || selectedTopic
                ? 'Try adjusting your search filters.'
                : 'Get started by creating your first knowledge evaluation quiz.'}
            </p>
            <Link
              to="/admin/quizzes/create"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
              Create First Quiz
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Quiz Details</th>
                  <th className="px-5 py-3.5">Topic & Curriculum</th>
                  <th className="px-5 py-3.5">Questions</th>
                  <th className="px-5 py-3.5">Passing Score</th>
                  <th className="px-5 py-3.5">Time Limit</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuizzes.map((quiz) => {
                  const isConfirming = deleteConfirmId === quiz.id;

                  return (
                    <tr key={quiz.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <Link
                            to={`/quizzes/${quiz.slug || quiz.id}`}
                            className="font-bold text-slate-900 hover:text-indigo-600 transition flex items-center gap-1.5"
                          >
                            <Award className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{quiz.title}</span>
                          </Link>
                          <div className="text-[11px] font-mono text-slate-400">
                            /{quiz.slug}
                          </div>
                          {quiz.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">
                              {quiz.description}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-800">
                            {quiz.topic?.title || 'Unassigned Topic'}
                          </span>
                          {quiz.topic?.section?.title && (
                            <div className="text-[10px] text-slate-400">
                              {quiz.topic.section.module?.title} &gt; {quiz.topic.section.title}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {quiz.questions?.length || 0} Questions
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-700">
                          {quiz.passingScore || 70}%
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {quiz.timeLimitMinutes ? (
                          <span className="inline-flex items-center gap-1 text-slate-600">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{quiz.timeLimitMinutes} mins</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">Untimed</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {quiz.published ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Draft
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/quizzes/${quiz.slug || quiz.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition"
                            title="Take Quiz"
                          >
                            <Play className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/quizzes/${quiz.id}/edit`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 transition"
                            title="Edit Quiz"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {isConfirming ? (
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleDelete(quiz.id)}
                                className="px-2 py-1 rounded bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700 transition"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 rounded bg-slate-200 text-slate-700 text-[10px] font-bold hover:bg-slate-300 transition"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(quiz.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
                              title="Delete Quiz"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
