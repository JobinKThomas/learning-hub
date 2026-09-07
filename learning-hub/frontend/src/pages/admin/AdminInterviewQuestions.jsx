import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchInterviewQuestions,
  deleteInterviewQuestion,
  clearInterviewQuestionActionState,
} from '../../features/interviewQuestions/interviewQuestionSlice';
import { fetchTopics } from '../../features/topics/topicSlice';
import {
  getDifficultyMeta,
  getFrequencyMeta,
} from '../../features/interviewQuestions/components/InterviewQuestionCard';
import {
  HelpCircle,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Check,
  Filter,
  Flame,
  Layers,
  Code2,
  Eye,
} from 'lucide-react';

export default function AdminInterviewQuestions() {
  const dispatch = useDispatch();
  const { questions, loading, actionLoading, error } = useSelector(
    (state) => state.interviewQuestions
  );
  const { topics } = useSelector((state) => state.topics);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    dispatch(fetchTopics());
    dispatch(fetchInterviewQuestions());
    return () => {
      dispatch(clearInterviewQuestionActionState());
    };
  }, [dispatch]);

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteInterviewQuestion(id)).unwrap();
      setStatusMessage('Interview question deleted successfully.');
      setDeleteConfirmId(null);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      alert(`Error deleting question: ${err}`);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      q.question.toLowerCase().includes(term) ||
      q.answer.toLowerCase().includes(term) ||
      (q.tags || []).some((tag) => tag.toLowerCase().includes(term));

    const matchesTopic = selectedTopic
      ? q.topic?.slug === selectedTopic || q.topic?.id === selectedTopic
      : true;
    const matchesDifficulty = selectedDifficulty
      ? q.difficulty === selectedDifficulty
      : true;

    return matchesSearch && matchesTopic && matchesDifficulty;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Admin Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/interview-questions"
            className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
          >
            <Eye className="w-4 h-4 mr-1.5 text-indigo-600" />
            View Student Hub
          </Link>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-indigo-950 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-200 text-xs font-semibold border border-rose-400/30">
            <Flame className="w-3.5 h-3.5 text-rose-300" />
            <span>Phase 12 Interview Hub</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Interview Questions Administration
          </h1>
          <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
            Manage technical interview questions, model answers, code snippets, and difficulty levels across curriculum topics.
          </p>
        </div>

        <Link
          to="/admin/interview-questions/create"
          className="inline-flex items-center px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-md shadow-rose-600/30 transition"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Create Question
        </Link>
      </div>

      {/* Status Notification */}
      {statusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Questions Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by question, answer, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            {/* Topic Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full sm:w-48 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              >
                <option value="">All Topics</option>
                {topics.map((t) => (
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
              className="w-full sm:w-44 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="">All Difficulties</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>
              Total questions: <strong className="text-slate-900 font-bold">{questions.length}</strong>
            </span>
            <button
              onClick={() => dispatch(fetchInterviewQuestions())}
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
                <th className="py-3.5 px-5">Question & Tags</th>
                <th className="py-3.5 px-4">Topic Lineage</th>
                <th className="py-3.5 px-4">Difficulty</th>
                <th className="py-3.5 px-4">Frequency</th>
                <th className="py-3.5 px-4 text-center">Order</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading && questions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-600" />
                    <span>Loading questions...</span>
                  </td>
                </tr>
              ) : filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    No interview questions found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredQuestions.map((q) => {
                  const diffMeta = getDifficultyMeta(q.difficulty);
                  const freqMeta = getFrequencyMeta(q.frequency);
                  const FreqIcon = freqMeta.Icon;

                  return (
                    <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5 max-w-md">
                        <div className="font-bold text-slate-900 line-clamp-2 font-sans">
                          {q.question}
                        </div>
                        {q.tags && q.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {q.tags.map((t, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {q.topic ? (
                          <div>
                            <Link
                              to={`/topics/${q.topic.slug}`}
                              className="font-semibold text-indigo-600 hover:text-indigo-800"
                            >
                              {q.topic.title}
                            </Link>
                            {q.lineage?.module && (
                              <div className="text-[10px] text-slate-400">
                                {q.lineage.module.title}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">Unlinked</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${diffMeta.badgeClass}`}
                        >
                          {diffMeta.label}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${freqMeta.badgeClass}`}
                        >
                          <FreqIcon className="w-3 h-3" />
                          {freqMeta.label}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-slate-700">
                        {q.order ?? 1}
                      </td>
                      <td className="py-4 px-4">
                        {q.published !== false ? (
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
                            to={`/admin/interview-questions/${q.id}/edit`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 transition"
                            title="Edit Question"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteConfirmId(q.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                            title="Delete Question"
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
            <h3 className="text-lg font-bold text-slate-900">Delete Interview Question?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete this interview question? It will no longer appear in student review lists.
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
