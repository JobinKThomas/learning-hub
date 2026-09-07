import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchInterviewQuestions } from '../features/interviewQuestions/interviewQuestionSlice';
import { fetchTopics } from '../features/topics/topicSlice';
import InterviewQuestionCard from '../features/interviewQuestions/components/InterviewQuestionCard';
import { useAuth } from '../hooks/useAuth';
import {
  HelpCircle,
  Search,
  Filter,
  Plus,
  Flame,
  AlertCircle,
  Sparkles,
  Layers,
} from 'lucide-react';

export default function InterviewQuestions() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { questions, count, loading, error } = useSelector(
    (state) => state.interviewQuestions
  );
  const { topics } = useSelector((state) => state.topics);
  const { isAdmin } = useAuth();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedTopic, setSelectedTopic] = useState(searchParams.get('topic') || '');
  const [selectedDifficulty, setSelectedDifficulty] = useState(
    searchParams.get('difficulty') || ''
  );

  // Load topics for filter dropdown
  useEffect(() => {
    dispatch(fetchTopics());
  }, [dispatch]);

  // Fetch interview questions when filters change
  useEffect(() => {
    const params = {};
    if (selectedTopic) params.topic = selectedTopic;
    if (searchTerm) params.search = searchTerm;
    if (selectedDifficulty) params.difficulty = selectedDifficulty;

    dispatch(fetchInterviewQuestions(params));
  }, [dispatch, selectedTopic, searchTerm, selectedDifficulty]);

  const handleTopicChange = (e) => {
    const value = e.target.value;
    setSelectedTopic(value);
    if (value) {
      searchParams.set('topic', value);
    } else {
      searchParams.delete('topic');
    }
    setSearchParams(searchParams);
  };

  const handleDifficultyChange = (difficulty) => {
    const nextVal = selectedDifficulty === difficulty ? '' : difficulty;
    setSelectedDifficulty(nextVal);
    if (nextVal) {
      searchParams.set('difficulty', nextVal);
    } else {
      searchParams.delete('difficulty');
    }
    setSearchParams(searchParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm) {
      searchParams.set('search', searchTerm);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              Phase 12 Interview Prep
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {count} Questions Available
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans">
            Technical Interview Questions
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Practice real-world engineering interview questions. Test your understanding, articulate your answer mentally, and click <strong>Reveal Answer</strong> to compare with standard explanations and code.
          </p>
        </div>

        {isAdmin && (
          <Link
            to="/admin/interview-questions/create"
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Interview Question</span>
          </Link>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search interview questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </form>

          {/* Topic Dropdown Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedTopic}
              onChange={handleTopicChange}
              className="w-full md:w-64 px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-slate-700 font-medium"
            >
              <option value="">All Topics (Universal)</option>
              {topics &&
                topics.map((t) => (
                  <option key={t.id} value={t.slug}>
                    {t.title} ({t.section?.title || 'Section'})
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Difficulty Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-400 mr-2">Difficulty:</span>
          {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => handleDifficultyChange(diff)}
              className={`text-xs font-bold px-3 py-1 rounded-lg transition-all border ${
                selectedDifficulty === diff
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {diff.charAt(0) + diff.slice(1).toLowerCase()}
            </button>
          ))}

          {selectedDifficulty && (
            <button
              type="button"
              onClick={() => handleDifficultyChange(selectedDifficulty)}
              className="text-xs text-rose-500 hover:underline font-semibold ml-2"
            >
              Clear difficulty
            </button>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Question List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : questions && questions.length > 0 ? (
        <div className="space-y-5">
          {questions.map((q, idx) => (
            <InterviewQuestionCard
              key={q.id}
              question={q}
              index={idx + 1}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
            <HelpCircle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            No Interview Questions Found
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {searchTerm || selectedTopic || selectedDifficulty
              ? 'No questions matched your filter criteria. Try clearing filters.'
              : 'There are no interview questions available yet.'}
          </p>
          {(searchTerm || selectedTopic || selectedDifficulty) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedTopic('');
                setSelectedDifficulty('');
                setSearchParams({});
              }}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
