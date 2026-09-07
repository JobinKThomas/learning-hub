import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchLearningPaths,
  setFilters,
  resetFilters,
} from '../features/learningPaths/learningPathSlice';
import LearningPathCard from '../features/learningPaths/components/LearningPathCard';
import { useAuth } from '../hooks/useAuth';
import {
  Search,
  Filter,
  Layers,
  Sparkles,
  RefreshCw,
  PlusCircle,
  AlertCircle,
  Compass,
} from 'lucide-react';

const CATEGORIES = ['All', 'Frontend', 'Backend', 'Full Stack', 'Mobile', 'DevOps'];
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function LearningPaths() {
  const dispatch = useDispatch();
  const { paths, count, loading, error, filters } = useSelector(
    (state) => state.learningPaths
  );
  const { isAdmin } = useAuth();

  const [searchInput, setSearchInput] = useState(filters.search || '');

  // Fetch when filters change
  useEffect(() => {
    dispatch(
      fetchLearningPaths({
        category: filters.category !== 'All' ? filters.category : undefined,
        level: filters.level !== 'All' ? filters.level : undefined,
        search: filters.search ? filters.search : undefined,
      })
    );
  }, [dispatch, filters.category, filters.level, filters.search]);

  // Handle Search Input submit / debounced
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchInput }));
  };

  const handleCategorySelect = (category) => {
    dispatch(setFilters({ category }));
  };

  const handleLevelSelect = (e) => {
    dispatch(setFilters({ level: e.target.value }));
  };

  const handleResetFilters = () => {
    setSearchInput('');
    dispatch(resetFilters());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <Compass className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Structured Curricula & Hands-on Mastery</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Explore Learning Paths
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Follow comprehensive, sequential curricula designed by industry experts.
            Master key developer skills from fundamentals to production-grade architecture.
          </p>

          {isAdmin && (
            <div className="pt-2">
              <Link
                to="/admin/learning-paths/create"
                className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
              >
                <PlusCircle className="w-4 h-4 mr-1.5" />
                Create New Learning Path (Admin)
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-grow max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by topic, language, or keyword..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition"
            >
              Search
            </button>
          </form>

          {/* Level Filter Dropdown */}
          <div className="flex items-center gap-3">
            <div className="flex items-center text-xs font-semibold text-slate-500 whitespace-nowrap">
              <Filter className="w-3.5 h-3.5 mr-1" />
              <span>Level:</span>
            </div>
            <select
              value={filters.level}
              onChange={handleLevelSelect}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              {LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl === 'All' ? 'All Levels' : lvl}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-medium text-slate-500 mr-2">Categories:</span>
          {CATEGORIES.map((cat) => {
            const isSelected = filters.category === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-medium text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-900 font-bold">{paths.length}</strong> learning
          paths
        </span>
        {(filters.category !== 'All' || filters.level !== 'All' || filters.search) && (
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Reset all filters
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-6 h-72 animate-pulse flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-slate-200" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-100 rounded" />
                  <div className="h-4 bg-slate-100 rounded w-5/6" />
                </div>
              </div>
              <div className="h-10 bg-slate-200 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : paths.length > 0 ? (
        /* Grid of Learning Paths */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paths.map((path) => (
            <LearningPathCard key={path.id || path.slug} path={path} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No learning paths found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            We couldn't find any learning paths matching your current filter criteria. Try adjusting
            your search term or clearing filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
