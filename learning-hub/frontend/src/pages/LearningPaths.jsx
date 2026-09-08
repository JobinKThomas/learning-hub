import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchLearningPaths,
  setFilters,
  setPage,
  resetFilters,
} from '../features/learningPaths/learningPathSlice';
import { fetchOverallProgress } from '../features/progress/progressSlice';
import LearningPathCard from '../features/learningPaths/components/LearningPathCard';
import Pagination from '../components/Pagination';
import { useAuth } from '../hooks/useAuth';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { normalizeList } from '../utils/normalize';
import {
  Search,
  Filter,
  Layers,
  Sparkles,
  RefreshCw,
  PlusCircle,
  AlertCircle,
  Compass,
  SlidersHorizontal,
  ArrowUpDown,
  CheckCircle2,
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

export default function LearningPaths() {
  const dispatch = useDispatch();
  const { paths: rawPaths, count, loading, error, filters, pagination } = useSelector(
    (state) => state.learningPaths
  );
  const paths = normalizeList(rawPaths);
  const { overallProgress } = useSelector((state) => state.progress);
  const { user, isAdmin } = useAuth();

  const [searchInput, setSearchInput] = useState(filters.search || '');

  // Dispatch fetch when filters or pagination change
  useEffect(() => {
    dispatch(
      fetchLearningPaths({
        category: filters.category !== 'All' ? filters.category : undefined,
        difficulty: filters.level !== 'All' ? filters.level : undefined,
        level: filters.level !== 'All' ? filters.level : undefined,
        status: filters.status !== 'All' ? filters.status.toLowerCase() : undefined,
        search: filters.search ? filters.search : undefined,
        sort: filters.sort || 'createdAt',
        order: filters.order || 'desc',
        page: filters.page || 1,
        limit: filters.limit || 6,
      })
    );
  }, [
    dispatch,
    filters.category,
    filters.level,
    filters.status,
    filters.search,
    filters.sort,
    filters.order,
    filters.page,
    filters.limit,
  ]);

  useEffect(() => {
    if (user) {
      dispatch(fetchOverallProgress());
    }
  }, [dispatch, user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchInput }));
  };

  const handleClearSearch = () => {
    setSearchInput('');
    dispatch(setFilters({ search: '' }));
  };

  const handleCategorySelect = (category) => {
    dispatch(setFilters({ category }));
  };

  const handleDifficultySelect = (e) => {
    dispatch(setFilters({ level: e.target.value }));
  };

  const handleStatusSelect = (status) => {
    dispatch(setFilters({ status }));
  };

  const handleSortChange = (e) => {
    const selected = SORT_OPTIONS.find((s) => `${s.value}-${s.order}` === e.target.value);
    if (selected) {
      dispatch(setFilters({ sort: selected.value, order: selected.order }));
    }
  };

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    dispatch(resetFilters());
  };

  const activeSortValue = `${filters.sort || 'createdAt'}-${filters.order || 'desc'}`;
  const hasActiveFilters =
    filters.category !== 'All' ||
    filters.level !== 'All' ||
    filters.status !== 'All' ||
    Boolean(filters.search);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <Compass className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] sm:text-xs font-semibold border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Structured Curricula & Hands-on Mastery</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            Explore Learning Paths
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
            Follow comprehensive, sequential curricula designed by industry experts.
            Master key developer skills from fundamentals to production-grade architecture.
          </p>

          {isAdmin && (
            <div className="pt-2">
              <Link
                to="/admin/learning-paths/create"
                className="inline-flex items-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition min-h-[44px]"
              >
                <PlusCircle className="w-4 h-4 mr-1.5" />
                <span>Create New Learning Path (Admin)</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        {/* Top Controls: Search Form, Status, Difficulty, Sort */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
          {/* Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="md:col-span-5 relative flex items-center"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search: JavaScript, React, Backend..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-20 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-16 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow-2xs"
            >
              Search
            </button>
          </form>

          {/* Difficulty / Level Dropdown */}
          <div className="md:col-span-3 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Difficulty:
            </span>
            <select
              value={filters.level}
              onChange={handleDifficultySelect}
              className="w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              {DIFFICULTIES.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl === 'All' ? 'All Difficulties' : lvl}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-4 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort:
            </span>
            <select
              value={activeSortValue}
              onChange={handleSortChange}
              className="w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={`${opt.value}-${opt.order}`} value={`${opt.value}-${opt.order}`}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Row: Status (if Admin) & Category Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1.5">Category:</span>
            {CATEGORIES.map((cat) => {
              const isSelected = filters.category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-none'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Status Filter (Admin visible or general) */}
          {isAdmin && (
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">Status:</span>
              {STATUSES.map((st) => {
                const isSelected = filters.status === st;
                return (
                  <button
                    key={st}
                    onClick={() => handleStatusSelect(st)}
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border transition ${
                      isSelected
                        ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Results Header with Active Filters */}
      <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 px-1">
        <div>
          Showing{' '}
          <strong className="text-slate-900 dark:text-slate-100 font-bold">
            {paths.length}
          </strong>{' '}
          of{' '}
          <strong className="text-slate-900 dark:text-slate-100 font-bold">
            {pagination?.total ?? count}
          </strong>{' '}
          learning paths
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset all filters
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <ErrorState
          title="Unable to load learning paths."
          message={error}
          onRetry={() => {
            dispatch(
              fetchLearningPaths({
                category: filters.category !== 'All' ? filters.category : undefined,
                difficulty: filters.level !== 'All' ? filters.level : undefined,
                level: filters.level !== 'All' ? filters.level : undefined,
                status: filters.status !== 'All' ? filters.status.toLowerCase() : undefined,
                search: filters.search ? filters.search : undefined,
                sort: filters.sort || 'createdAt',
                order: filters.order || 'desc',
                page: filters.page || 1,
                limit: filters.limit || 6,
              })
            );
          }}
          variant="banner"
        />
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <LoadingState variant="cards" count={6} />
      ) : paths.length > 0 ? (
        /* Grid of Learning Paths */
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paths.map((path) => {
              const prog = overallProgress?.learningPaths?.find(
                (lp) => lp.slug === path.slug || String(lp.id) === String(path.id || path._id)
              );
              return (
                <LearningPathCard
                  key={path.id || path.slug}
                  path={path}
                  progress={prog?.percentage}
                />
              );
            })}
          </div>

          {/* Pagination Controls */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <Pagination
              currentPage={pagination?.page || 1}
              totalPages={pagination?.totalPages || 1}
              onPageChange={handlePageChange}
              hasNextPage={pagination?.hasNextPage}
              hasPrevPage={pagination?.hasPrevPage}
              totalItems={pagination?.total || count}
              itemsPerPage={pagination?.limit || 6}
              itemName="learning paths"
              colorScheme="indigo"
            />
          </div>
        </div>
      ) : (
        /* Empty State */
        <EmptyState
          icon={Layers}
          title="No learning paths found"
          description="We couldn't find any learning paths matching your current filter criteria. Try adjusting your search term or clearing filters."
          actionText={hasActiveFilters ? "Clear Filters" : isAdmin ? "Create Learning Path" : undefined}
          onAction={hasActiveFilters ? handleResetFilters : undefined}
          actionLink={!hasActiveFilters && isAdmin ? "/admin/learning-paths/create" : undefined}
        />
      )}
    </div>
  );
}
