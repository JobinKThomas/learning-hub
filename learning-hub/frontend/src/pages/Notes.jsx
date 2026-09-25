import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchNotes } from '../features/notes/noteSlice';
import { fetchLearningPaths } from '../features/learningPaths/learningPathSlice';
import { fetchModules } from '../features/modules/moduleSlice';
import NoteCard from '../features/notes/components/NoteCard';
import { useAuth } from '../hooks/useAuth';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { normalizeList } from '../utils/normalize';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Tag,
  Clock,
  Layers,
  Sparkles,
  Compass,
  ChevronDown,
  ChevronUp,
  X,
  RotateCcw,
} from 'lucide-react';

const INITIAL_TAG_LIMIT = 8;

export default function Notes() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Redux state
  const { notes: rawNotes, count, loading, error } = useSelector((state) => state.notes);
  const { paths: rawPaths } = useSelector((state) => state.learningPaths);
  const { modules: rawModules } = useSelector((state) => state.modules);
  const { isAdmin } = useAuth();

  const notes = normalizeList(rawNotes);
  const learningPaths = normalizeList(rawPaths);
  const allModules = normalizeList(rawModules);

  // Local state initialized from URL query params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedPath, setSelectedPath] = useState(searchParams.get('path') || '');
  const [selectedModule, setSelectedModule] = useState(searchParams.get('module') || '');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  const [showAllTags, setShowAllTags] = useState(false);

  // Filter modules based on selected learning path
  const availableModules = useMemo(() => {
    if (!selectedPath) return allModules;
    return allModules.filter((m) => {
      const p = m.learningPath;
      if (!p) return false;
      const pathId = typeof p === 'object' ? (p.slug || p._id || p.id) : p;
      return pathId === selectedPath;
    });
  }, [allModules, selectedPath]);

  // Compute tag frequencies from loaded notes and rank them
  const { sortedTags, totalTagCount } = useMemo(() => {
    const counts = {};
    notes.forEach((n) => {
      (n.tags || []).forEach((t) => {
        const tag = t?.toString().trim().toLowerCase();
        if (tag) {
          counts[tag] = (counts[tag] || 0) + 1;
        }
      });
    });

    // Make sure active tag has an entry if set
    if (selectedTag && !counts[selectedTag.toLowerCase()]) {
      counts[selectedTag.toLowerCase()] = 0;
    }

    const entries = Object.entries(counts);
    entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

    return {
      sortedTags: entries.map(([tag, count]) => ({ tag, count })),
      totalTagCount: entries.length,
    };
  }, [notes, selectedTag]);

  // Determine tags to display (pinned active tag + top 8, or all when expanded)
  const visibleTags = useMemo(() => {
    if (showAllTags) return sortedTags;

    const topTags = sortedTags.slice(0, INITIAL_TAG_LIMIT);
    if (selectedTag) {
      const isAlreadyVisible = topTags.some(
        (t) => t.tag.toLowerCase() === selectedTag.toLowerCase()
      );
      if (!isAlreadyVisible) {
        const activeEntry = sortedTags.find(
          (t) => t.tag.toLowerCase() === selectedTag.toLowerCase()
        ) || { tag: selectedTag, count: 0 };
        return [activeEntry, ...topTags.slice(0, INITIAL_TAG_LIMIT - 1)];
      }
    }
    return topTags;
  }, [sortedTags, showAllTags, selectedTag]);

  // Check if any filter is active
  const hasActiveFilters = Boolean(selectedPath || selectedModule || selectedTag || searchTerm);

  // Load learning paths and modules for filters
  useEffect(() => {
    dispatch(fetchLearningPaths());
    dispatch(fetchModules());
  }, [dispatch]);

  // Fetch notes when filter params change
  useEffect(() => {
    const params = {};
    if (selectedPath) params.learningPath = selectedPath;
    if (selectedModule) params.module = selectedModule;
    if (searchTerm) params.search = searchTerm;
    if (selectedTag) params.tag = selectedTag;

    dispatch(fetchNotes(params));
  }, [dispatch, selectedPath, selectedModule, searchTerm, selectedTag]);

  // Handlers
  const handlePathChange = (e) => {
    const value = e.target.value;
    setSelectedPath(value);
    setSelectedModule(''); // Reset module when learning path changes
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set('path', value);
    } else {
      newParams.delete('path');
    }
    newParams.delete('module');
    setSearchParams(newParams);
  };

  const handleModuleChange = (e) => {
    const value = e.target.value;
    setSelectedModule(value);
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set('module', value);
      // Auto-select parent learning path if not yet selected
      if (!selectedPath) {
        const found = allModules.find((m) => m.slug === value || m.id === value || m._id === value);
        const p = found?.learningPath;
        const pSlug = typeof p === 'object' ? (p.slug || p._id || p.id) : p;
        if (pSlug) {
          setSelectedPath(pSlug);
          newParams.set('path', pSlug);
        }
      }
    } else {
      newParams.delete('module');
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm) {
      newParams.set('search', searchTerm);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleTagClick = (tag) => {
    const nextTag = selectedTag.toLowerCase() === tag.toLowerCase() ? '' : tag;
    setSelectedTag(nextTag);
    const newParams = new URLSearchParams(searchParams);
    if (nextTag) {
      newParams.set('tag', nextTag);
    } else {
      newParams.delete('tag');
    }
    setSearchParams(newParams);
  };

  const handleClearFilter = (key) => {
    const newParams = new URLSearchParams(searchParams);
    if (key === 'path') {
      setSelectedPath('');
      setSelectedModule('');
      newParams.delete('path');
      newParams.delete('module');
    } else if (key === 'module') {
      setSelectedModule('');
      newParams.delete('module');
    } else if (key === 'tag') {
      setSelectedTag('');
      newParams.delete('tag');
    } else if (key === 'search') {
      setSearchTerm('');
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleResetAllFilters = () => {
    setSearchTerm('');
    setSelectedPath('');
    setSelectedModule('');
    setSelectedTag('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              Study Guides
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {count} Study Notes
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans">
            Curriculum Study Notes
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            In-depth guides, code architecture explanations, and key takeaways structured across Learning Paths and Modules.
          </p>
        </div>

        {isAdmin && (
          <Link
            to="/admin/notes/create"
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Note</span>
          </Link>
        )}
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Form (4 columns) */}
          <form onSubmit={handleSearchSubmit} className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notes by title or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </form>

          {/* Learning Path Dropdown (4 columns) */}
          <div className="md:col-span-4 relative flex items-center">
            <Compass className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <select
              value={selectedPath}
              onChange={handlePathChange}
              className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-slate-700 dark:text-slate-200 font-medium appearance-none cursor-pointer"
            >
              <option value="">All Learning Paths</option>
              {learningPaths.map((p) => (
                <option key={p.id} value={p.slug}>
                  {p.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
          </div>

          {/* Module Dropdown (4 columns) */}
          <div className="md:col-span-4 relative flex items-center">
            <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <select
              value={selectedModule}
              onChange={handleModuleChange}
              className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-slate-700 dark:text-slate-200 font-medium appearance-none cursor-pointer"
            >
              <option value="">
                {selectedPath ? 'All Modules in Path' : 'All Modules'}
              </option>
              {availableModules.map((m) => (
                <option key={m.id} value={m.slug}>
                  {m.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
          </div>
        </div>

        {/* Active Filters Pill Row */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-400 dark:text-slate-500 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>Active:</span>
            </span>

            {selectedPath && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 font-medium shadow-xs">
                <span>Path: {learningPaths.find((p) => p.slug === selectedPath || p.id === selectedPath)?.title || selectedPath}</span>
                <button
                  type="button"
                  onClick={() => handleClearFilter('path')}
                  className="hover:bg-indigo-200/50 dark:hover:bg-indigo-800/50 rounded p-0.5 transition cursor-pointer"
                  title="Remove path filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedModule && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 font-medium shadow-xs">
                <span>Module: {allModules.find((m) => m.slug === selectedModule || m.id === selectedModule)?.title || selectedModule}</span>
                <button
                  type="button"
                  onClick={() => handleClearFilter('module')}
                  className="hover:bg-indigo-200/50 dark:hover:bg-indigo-800/50 rounded p-0.5 transition cursor-pointer"
                  title="Remove module filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchTerm && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 font-medium shadow-xs">
                <span>"{searchTerm}"</span>
                <button
                  type="button"
                  onClick={() => handleClearFilter('search')}
                  className="hover:bg-indigo-200/50 dark:hover:bg-indigo-800/50 rounded p-0.5 transition cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedTag && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-medium shadow-xs">
                <span>#{selectedTag}</span>
                <button
                  type="button"
                  onClick={() => handleClearFilter('tag')}
                  className="hover:bg-indigo-700 rounded p-0.5 transition cursor-pointer"
                  title="Clear tag"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleResetAllFilters}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition ml-2 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset all</span>
            </button>
          </div>
        )}

        {/* Compact Popular Tags Section */}
        {sortedTags.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1 shrink-0">
                <Tag className="w-3 h-3 text-indigo-500" />
                <span>Popular Tags:</span>
              </span>

              {visibleTags.map(({ tag, count: tagFreq }) => {
                const isActive = selectedTag.toLowerCase() === tag.toLowerCase();
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    <span>#{tag}</span>
                    {tagFreq > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isActive
                            ? 'bg-indigo-700/80 text-white'
                            : 'bg-slate-200/70 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {tagFreq}
                      </span>
                    )}
                    {isActive && <X className="w-3 h-3 ml-0.5 text-white/80 hover:text-white" />}
                  </button>
                );
              })}

              {/* Show More / Show Less Toggle Button */}
              {totalTagCount > INITIAL_TAG_LIMIT && (
                <button
                  type="button"
                  onClick={() => setShowAllTags(!showAllTags)}
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition inline-flex items-center gap-1 ml-1 cursor-pointer"
                >
                  <span>{showAllTags ? 'Show less' : `+${totalTagCount - INITIAL_TAG_LIMIT} more`}</span>
                  {showAllTags ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <ErrorState
          title="Unable to load study notes."
          message={error}
          onRetry={() => {
            const params = {};
            if (selectedPath) params.learningPath = selectedPath;
            if (selectedModule) params.module = selectedModule;
            if (searchTerm) params.search = searchTerm;
            if (selectedTag) params.tag = selectedTag;
            dispatch(fetchNotes(params));
          }}
          variant="banner"
        />
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <LoadingState variant="cards" count={6} />
      ) : notes && notes.length > 0 ? (
        /* Notes Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} showTopic={true} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <EmptyState
          icon={BookOpen}
          title="No Notes Found"
          description={
            hasActiveFilters
              ? 'No study notes matched your selected filters. Try adjusting or clearing filters.'
              : 'There are no study notes available yet.'
          }
          actionText={
            hasActiveFilters
              ? 'Reset Filters'
              : isAdmin
              ? 'Create New Note'
              : undefined
          }
          onAction={hasActiveFilters ? handleResetAllFilters : undefined}
          actionLink={
            !hasActiveFilters && isAdmin ? '/admin/notes/create' : undefined
          }
        />
      )}
    </div>
  );
}
