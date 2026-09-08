import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { createTopic } from '../../features/topics/topicSlice';
import { fetchSections } from '../../features/sections/sectionSlice';
import {
  ArrowLeft,
  PlusCircle,
  Save,
  BookOpen,
  Sparkles,
  AlertCircle,
  Code2,
  Terminal,
  Trash2,
} from 'lucide-react';

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function CreateTopic() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedSection = searchParams.get('section');

  const { sections } = useSelector((state) => state.sections);
  const { actionLoading, error } = useSelector((state) => state.topics);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    section: preselectedSection || '',
    summary: '',
    description: '',
    duration: '',
    order: 1,
    keyPointsInput: '',
    content: '',
    published: true,
  });

  const [codeExamples, setCodeExamples] = useState([]);

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    dispatch(fetchSections());
  }, [dispatch]);

  useEffect(() => {
    if (sections && sections.length > 0 && !formData.section) {
      if (preselectedSection) {
        const found = sections.find(
          (s) => s.slug === preselectedSection || s.id === preselectedSection
        );
        if (found) {
          setFormData((prev) => ({ ...prev, section: found.id }));
        }
      } else {
        setFormData((prev) => ({ ...prev, section: sections[0].id }));
      }
    }
  }, [sections, preselectedSection, formData.section]);

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: slugManuallyEdited ? prev.slug : slugify(val),
    }));
  };

  const handleSlugChange = (e) => {
    setSlugManuallyEdited(true);
    setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleExampleChange = (index, field, value) => {
    setCodeExamples((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addExample = () => {
    setCodeExamples((prev) => [
      ...prev,
      {
        title: `Example ${prev.length + 1}`,
        language: 'javascript',
        code: '',
        explanation: '',
      },
    ]);
  };

  const removeExample = (index) => {
    setCodeExamples((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError('Topic title is required.');
      return;
    }

    if (!formData.section) {
      setFormError('Please select a parent section.');
      return;
    }

    if (!formData.description.trim()) {
      setFormError('Topic description is required.');
      return;
    }

    const keyPoints = formData.keyPointsInput
      ? formData.keyPointsInput
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean)
      : [];

    const validCodeExamples = codeExamples
      .filter((ex) => ex.code.trim())
      .map((ex) => ({
        title: ex.title.trim() || 'Code Example',
        language: ex.language.trim() || 'javascript',
        code: ex.code,
        explanation: ex.explanation.trim(),
      }));

    const payload = {
      title: formData.title.trim(),
      slug: slugify(formData.slug || formData.title),
      section: formData.section,
      summary: formData.summary.trim(),
      description: formData.description.trim(),
      duration: formData.duration.trim() || '15 mins',
      order: Number(formData.order) || 1,
      keyPoints,
      codeExamples: validCodeExamples,
      content: formData.content.trim(),
      published: formData.published,
    };

    try {
      await dispatch(createTopic(payload)).unwrap();
      navigate('/admin/topics');
    } catch (err) {
      setFormError(err || 'Failed to create topic');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/topics"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-purple-700 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Topics Management
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-semibold border border-purple-400/30">
            <PlusCircle className="w-3.5 h-3.5 text-purple-300" />
            <span>Curriculum Topic Creator</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Create Topic Lesson
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Define a discrete coding topic (e.g. let), interactive code examples, and key takeaway checklist.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {(formError || error) && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{formError || error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="space-y-5">
          {/* Parent Section Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Parent Section *
            </label>
            <select
              name="section"
              required
              value={formData.section}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">-- Select a Parent Section --</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} {s.module?.title ? `(Module: ${s.module.title})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Topic Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="e.g., let"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                name="slug"
                required
                value={formData.slug}
                onChange={handleSlugChange}
                placeholder="e.g., let"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Punchline Summary
            </label>
            <input
              type="text"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              placeholder="e.g., Block-scoped mutable variable declaration with TDZ"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Duration */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Duration
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g., 15 mins"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Order */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sequential Order Number
              </label>
              <input
                type="number"
                name="order"
                min="1"
                max="100"
                value={formData.order}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              required
              rows="2"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief overview of the concept and its purpose in the language."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Key Points Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Key Mechanics (comma-separated)
            </label>
            <input
              type="text"
              name="keyPointsInput"
              value={formData.keyPointsInput}
              onChange={handleChange}
              placeholder="Block-scoped, Temporal Dead Zone, No re-declaration"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <span className="text-[11px] text-slate-400">
              Each comma-separated item becomes an interactive checklist item for students.
            </span>
          </div>

          {/* Code Examples Builder */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Interactive Code Examples
              </label>
              <button
                type="button"
                onClick={addExample}
                className="inline-flex items-center text-xs font-semibold text-purple-600 hover:text-purple-800"
              >
                + Add Another Example
              </button>
            </div>

            {codeExamples.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">
                <p className="text-xs text-slate-500">No code examples added yet.</p>
                <button
                  type="button"
                  onClick={addExample}
                  className="mt-2 inline-flex items-center px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold hover:bg-purple-100 transition"
                >
                  <PlusCircle className="w-3.5 h-3.5 mr-1" />
                  Add Code Example
                </button>
              </div>
            ) : (
              codeExamples.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Example #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeExample(idx)}
                      className="text-red-500 hover:text-red-700 p-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Title (e.g. Block Scoping)"
                    value={ex.title}
                    onChange={(e) => handleExampleChange(idx, 'title', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="text"
                    placeholder="Language (e.g. javascript)"
                    value={ex.language}
                    onChange={(e) => handleExampleChange(idx, 'language', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <textarea
                  rows="3"
                  placeholder="// Paste JavaScript code here..."
                  value={ex.code}
                  onChange={(e) => handleExampleChange(idx, 'code', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-900 text-emerald-400 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <input
                  type="text"
                  placeholder="Explanation note for this code snippet..."
                  value={ex.explanation}
                  onChange={(e) => handleExampleChange(idx, 'explanation', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )))}
          </div>

          {/* Lesson Notes / Guide */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Study Guide (Markdown/Notes)
            </label>
            <textarea
              name="content"
              rows="5"
              value={formData.content}
              onChange={handleChange}
              placeholder="# Deep Dive Notes&#10;&#10;Explain mechanics, runtime memory model, and gotchas..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Published */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="published"
              name="published"
              checked={formData.published}
              onChange={handleChange}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
            />
            <label htmlFor="published" className="text-xs font-semibold text-slate-700">
              Publish immediately (visible to all students)
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Link
            to="/admin/topics"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={actionLoading}
            className="inline-flex items-center px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-200 transition"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {actionLoading ? 'Saving...' : 'Create Topic'}
          </button>
        </div>
      </form>
    </div>
  );
}
