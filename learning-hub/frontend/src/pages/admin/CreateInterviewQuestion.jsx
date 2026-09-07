import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { createInterviewQuestion } from '../../features/interviewQuestions/interviewQuestionSlice';
import { fetchTopics } from '../../features/topics/topicSlice';
import {
  ArrowLeft,
  PlusCircle,
  Save,
  HelpCircle,
  AlertCircle,
  Flame,
  Code2,
} from 'lucide-react';

export default function CreateInterviewQuestion() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedTopic = searchParams.get('topic');

  const { topics } = useSelector((state) => state.topics);
  const { actionLoading, error } = useSelector(
    (state) => state.interviewQuestions
  );

  const [formData, setFormData] = useState({
    topic: preselectedTopic || '',
    question: '',
    answer: '',
    codeSnippet: '',
    difficulty: 'BEGINNER',
    frequency: 'COMMON',
    tags: '',
    order: 1,
    published: true,
  });

  const [formError, setFormError] = useState(null);

  useEffect(() => {
    dispatch(fetchTopics());
  }, [dispatch]);

  useEffect(() => {
    if (topics && topics.length > 0 && !formData.topic) {
      if (preselectedTopic) {
        const found = topics.find(
          (t) => t.slug === preselectedTopic || t.id === preselectedTopic
        );
        if (found) {
          setFormData((prev) => ({ ...prev, topic: found.id }));
        }
      } else {
        setFormData((prev) => ({ ...prev, topic: topics[0].id }));
      }
    }
  }, [topics, preselectedTopic, formData.topic]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.topic) {
      setFormError('Parent topic selection is required.');
      return;
    }
    if (!formData.question.trim()) {
      setFormError('Question prompt is required.');
      return;
    }
    if (!formData.answer.trim()) {
      setFormError('Model answer is required.');
      return;
    }

    const payload = {
      topic: formData.topic,
      question: formData.question.trim(),
      answer: formData.answer.trim(),
      codeSnippet: formData.codeSnippet.trim() || undefined,
      difficulty: formData.difficulty,
      frequency: formData.frequency,
      tags: formData.tags
        ? formData.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      order: Number(formData.order) || 1,
      published: formData.published,
    };

    try {
      await dispatch(createInterviewQuestion(payload)).unwrap();
      navigate('/admin/interview-questions');
    } catch (err) {
      setFormError(err || 'Failed to create interview question');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Navigation Breadcrumb */}
      <Link
        to="/admin/interview-questions"
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Interview Questions Administration
      </Link>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-indigo-950 rounded-3xl p-8 text-white shadow-xl flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-200 text-xs font-semibold border border-rose-400/30">
            <Flame className="w-3.5 h-3.5 text-rose-300" />
            <span>Create Interview Question</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Add Technical Interview Question
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Craft a targeted interview question, model answer, and illustrative code snippet.
          </p>
        </div>
      </div>

      {/* Error Feedback */}
      {(formError || error) && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{formError || error}</span>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6"
      >
        {/* Parent Topic Selection */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Parent Topic <span className="text-red-500">*</span>
          </label>
          <select
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
          >
            <option value="" disabled>
              Select a Topic
            </option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.section?.title ? `${t.section.title}` : 'Topic'})
              </option>
            ))}
          </select>
        </div>

        {/* Question Prompt */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Question Prompt <span className="text-red-500">*</span>
          </label>
          <textarea
            name="question"
            rows="3"
            value={formData.question}
            onChange={handleChange}
            placeholder="e.g., What is the Temporal Dead Zone (TDZ) in JavaScript and how does it relate to let and const?"
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
          />
        </div>

        {/* Model Answer */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Comprehensive Model Answer <span className="text-red-500">*</span>
          </label>
          <textarea
            name="answer"
            rows="6"
            value={formData.answer}
            onChange={handleChange}
            placeholder="Provide a clear, articulate, senior-level explanation of the concept..."
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition leading-relaxed font-sans"
          />
        </div>

        {/* Code Snippet (Optional) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Code Snippet / Example (Optional)
            </label>
            <span className="text-[11px] text-slate-400 font-mono">JavaScript / Code</span>
          </div>
          <textarea
            name="codeSnippet"
            rows="5"
            value={formData.codeSnippet}
            onChange={handleChange}
            placeholder={`// Example illustrative snippet\nconsole.log(x); // ReferenceError: Cannot access 'x' before initialization\nlet x = 10;`}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-emerald-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        {/* Difficulty & Frequency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Difficulty Level <span className="text-red-500">*</span>
            </label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
            >
              <option value="BEGINNER">🟢 Beginner</option>
              <option value="INTERMEDIATE">🟡 Intermediate</option>
              <option value="ADVANCED">🟣 Advanced</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Asking Frequency <span className="text-red-500">*</span>
            </label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
            >
              <option value="FREQUENT">🔥 Frequently Asked (Must Know)</option>
              <option value="COMMON">⚡ Common (Standard)</option>
              <option value="RARE">💡 Specialized / Rare Edge Case</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g., scoping, hoisting, es6, closures"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
          />
        </div>

        {/* Order & Published Flag */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center pt-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Display Order
            </label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="published"
              name="published"
              checked={formData.published}
              onChange={handleChange}
              className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
            />
            <label
              htmlFor="published"
              className="text-xs font-semibold text-slate-700 cursor-pointer"
            >
              Published (Visible to Learners)
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <Link
            to="/admin/interview-questions"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={actionLoading}
            className="inline-flex items-center px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition disabled:opacity-50 gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{actionLoading ? 'Creating...' : 'Create Question'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
