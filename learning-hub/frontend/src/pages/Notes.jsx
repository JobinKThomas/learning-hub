import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchNotes } from '../features/notes/noteSlice';
import { fetchTopics } from '../features/topics/topicSlice';
import NoteCard from '../features/notes/components/NoteCard';
import { useAuth } from '../hooks/useAuth';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Tag,
  Clock,
  Layers,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export default function Notes() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { notes, count, loading, error } = useSelector((state) => state.notes);
  const { topics } = useSelector((state) => state.topics);
  const { isAdmin } = useAuth();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedTopic, setSelectedTopic] = useState(searchParams.get('topic') || '');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');

  // Load topics for filter dropdown
  useEffect(() => {
    dispatch(fetchTopics());
  }, [dispatch]);

  // Fetch notes when filter params change
  useEffect(() => {
    const params = {};
    if (selectedTopic) params.topic = selectedTopic;
    if (searchTerm) params.search = searchTerm;
    if (selectedTag) params.tag = selectedTag;

    dispatch(fetchNotes(params));
  }, [dispatch, selectedTopic, searchTerm, selectedTag]);

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm) {
      searchParams.set('search', searchTerm);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const handleTagClick = (tag) => {
    const nextTag = selectedTag === tag ? '' : tag;
    setSelectedTag(nextTag);
    if (nextTag) {
      searchParams.set('tag', nextTag);
    } else {
      searchParams.delete('tag');
    }
    setSearchParams(searchParams);
  };

  // Collect unique tags across notes
  const allTags = Array.from(
    new Set(notes.flatMap((n) => n.tags || []))
  ).filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              Phase 7 Content Tier
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {count} Study Notes
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans">
            Curriculum Study Notes
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            In-depth guides, code architecture explanations, and key takeaways across all topics. Select any note to read the full guide.
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
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notes by title or content..."
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

        {/* Tags Row */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>Popular Tags:</span>
            </span>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all ${
                  selectedTag === tag
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                #{tag}
              </button>
            ))}
            {selectedTag && (
              <button
                type="button"
                onClick={() => setSelectedTag('')}
                className="text-[10px] text-red-500 hover:underline ml-1 font-semibold"
              >
                Clear tag filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-52 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : notes && notes.length > 0 ? (
        /* Notes Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} showTopic={true} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Notes Found</h3>
          <p className="text-xs text-slate-500">
            {searchTerm || selectedTopic || selectedTag
              ? 'No study notes matched your search criteria. Try clearing filters.'
              : 'There are no study notes available yet.'}
          </p>
          {(searchTerm || selectedTopic || selectedTag) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedTopic('');
                setSelectedTag('');
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
