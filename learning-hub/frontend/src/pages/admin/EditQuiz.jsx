import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { fetchQuizById, updateQuiz } from '../../features/quizzes/quizSlice';
import { fetchTopics } from '../../features/topics/topicSlice';
import {
  Shield,
  ArrowLeft,
  Save,
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Code2,
  Award,
  RefreshCw,
} from 'lucide-react';

export default function EditQuiz() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentQuiz, detailsLoading, error: quizError } = useSelector(
    (state) => state.quizzes
  );
  const { topics } = useSelector((state) => state.topics);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    topic: '',
    description: '',
    passingScore: 70,
    timeLimitMinutes: '',
    order: 0,
    published: true,
  });

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    dispatch(fetchTopics());
    if (id) {
      dispatch(fetchQuizById({ id, mode: 'edit' }));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentQuiz) {
      setFormData({
        title: currentQuiz.title || '',
        slug: currentQuiz.slug || '',
        topic: currentQuiz.topic?.id || currentQuiz.topic?._id || currentQuiz.topic || '',
        description: currentQuiz.description || '',
        passingScore: currentQuiz.passingScore ?? 70,
        timeLimitMinutes: currentQuiz.timeLimitMinutes || '',
        order: currentQuiz.order ?? 0,
        published: currentQuiz.published ?? true,
      });

      if (currentQuiz.questions && currentQuiz.questions.length > 0) {
        setQuestions(
          currentQuiz.questions.map((q) => ({
            question: q.question || '',
            codeSnippet: q.codeSnippet || '',
            options: q.options ? [...q.options] : ['', ''],
            correctAnswer: q.correctAnswer ?? 0,
            explanation: q.explanation || '',
          }))
        );
      }
    }
  }, [currentQuiz]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Question manipulation
  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question: '',
        codeSnippet: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
      },
    ]);
  };

  const handleRemoveQuestion = (qIdx) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, idx) => idx !== qIdx));
  };

  const handleQuestionTextChange = (qIdx, field, val) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx] = { ...copy[qIdx], [field]: val };
      return copy;
    });
  };

  // Options manipulation
  const handleOptionChange = (qIdx, optIdx, val) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const opts = [...copy[qIdx].options];
      opts[optIdx] = val;
      copy[qIdx] = { ...copy[qIdx], options: opts };
      return copy;
    });
  };

  const handleAddOption = (qIdx) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx] = {
        ...copy[qIdx],
        options: [...copy[qIdx].options, ''],
      };
      return copy;
    });
  };

  const handleRemoveOption = (qIdx, optIdx) => {
    setQuestions((prev) => {
      const copy = [...prev];
      if (copy[qIdx].options.length <= 2) return prev;
      const opts = copy[qIdx].options.filter((_, idx) => idx !== optIdx);
      let corr = copy[qIdx].correctAnswer;
      if (corr === optIdx) {
        corr = 0;
      } else if (corr > optIdx) {
        corr -= 1;
      }
      copy[qIdx] = { ...copy[qIdx], options: opts, correctAnswer: corr };
      return copy;
    });
  };

  const handleCorrectAnswerSelect = (qIdx, optIdx) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx] = { ...copy[qIdx], correctAnswer: optIdx };
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!formData.topic) {
      setError('Please select a topic for this quiz.');
      setLoading(false);
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setError(`Question ${i + 1} text cannot be empty.`);
        setLoading(false);
        return;
      }
      const validOptions = q.options.filter((o) => o.trim().length > 0);
      if (validOptions.length < 2) {
        setError(`Question ${i + 1} must have at least 2 valid options.`);
        setLoading(false);
        return;
      }
      if (q.correctAnswer >= q.options.length) {
        setError(`Question ${i + 1} has an invalid correct answer selected.`);
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        title: formData.title,
        slug: formData.slug || undefined,
        topic: formData.topic,
        description: formData.description,
        passingScore: Number(formData.passingScore) || 70,
        timeLimitMinutes: formData.timeLimitMinutes ? Number(formData.timeLimitMinutes) : null,
        order: Number(formData.order) || 0,
        published: formData.published,
        questions: questions.map((q) => ({
          question: q.question.trim(),
          codeSnippet: q.codeSnippet.trim() || undefined,
          options: q.options.map((opt) => opt.trim()),
          correctAnswer: Number(q.correctAnswer),
          explanation: q.explanation.trim() || undefined,
        })),
      };

      await dispatch(updateQuiz({ id, payload })).unwrap();
      navigate('/admin/quizzes');
    } catch (err) {
      setError(err || 'Failed to update quiz');
    } finally {
      setLoading(false);
    }
  };

  if (detailsLoading && !currentQuiz) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading quiz for editing...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs text-purple-700 font-semibold mb-1">
          <Shield className="w-4 h-4" />
          <span>ADMINISTRATOR CONSOLE</span>
          <span>/</span>
          <Link to="/admin/quizzes" className="text-slate-500 hover:text-indigo-600">
            QUIZZES
          </Link>
          <span>/</span>
          <span className="text-slate-500">EDIT</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Edit Quiz: {currentQuiz?.title || 'Knowledge Check'}
          </h1>
          <Link
            to="/admin/quizzes"
            className="inline-flex items-center px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Cancel
          </Link>
        </div>
      </div>

      {(error || quizError) && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error || quizError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: General Quiz Meta */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Award className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">General Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Quiz Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleFormChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Target Topic <span className="text-rose-500">*</span>
              </label>
              <select
                name="topic"
                required
                value={formData.topic}
                onChange={handleFormChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">-- Select Parent Topic --</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.slug})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Custom Slug</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleFormChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Description</label>
              <textarea
                name="description"
                rows={2}
                value={formData.description}
                onChange={handleFormChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Passing Score Percentage (%)
              </label>
              <input
                type="number"
                name="passingScore"
                min={1}
                max={100}
                value={formData.passingScore}
                onChange={handleFormChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Time Limit (Minutes) <span className="text-slate-400 font-normal">(0 for untimed)</span>
              </label>
              <input
                type="number"
                name="timeLimitMinutes"
                min={0}
                value={formData.timeLimitMinutes}
                onChange={handleFormChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Display Order</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleFormChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="published"
                  checked={formData.published}
                  onChange={handleFormChange}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="text-xs font-bold text-slate-700">
                  Publish Quiz
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 2: Question Bank Builder */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Questions Bank ({questions.length})
              </h2>
            </div>

            <button
              type="button"
              onClick={handleAddQuestion}
              className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition gap-1 border border-indigo-200"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question</span>
            </button>
          </div>

          <div className="space-y-6">
            {questions.map((q, qIdx) => {
              const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

              return (
                <div
                  key={qIdx}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Question {qIdx + 1}
                    </span>

                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIdx)}
                        className="inline-flex items-center text-rose-500 hover:text-rose-700 text-xs font-semibold gap-1 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Question</span>
                      </button>
                    )}
                  </div>

                  {/* Question Text */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Question Prompt <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={q.question}
                      onChange={(e) =>
                        handleQuestionTextChange(qIdx, 'question', e.target.value)
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  {/* Optional Code Snippet */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Code Snippet <span className="text-slate-400 font-normal">(Optional)</span></span>
                    </label>
                    <textarea
                      rows={3}
                      value={q.codeSnippet}
                      onChange={(e) =>
                        handleQuestionTextChange(qIdx, 'codeSnippet', e.target.value)
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-950 text-emerald-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  {/* Options */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">
                        Answer Options <span className="text-slate-400 font-normal">(Select radio for the correct option)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleAddOption(qIdx)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Option</span>
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = q.correctAnswer === optIdx;
                        const letter = optionLetters[optIdx] || optIdx + 1;

                        return (
                          <div
                            key={optIdx}
                            className={`flex items-center gap-2 p-2 rounded-2xl border transition-all ${
                              isCorrect
                                ? 'border-emerald-300 bg-emerald-50/50'
                                : 'border-slate-200 bg-slate-50/40'
                            }`}
                          >
                            <label className="cursor-pointer flex items-center pl-2" title="Mark as correct answer">
                              <input
                                type="radio"
                                name={`correct-${qIdx}`}
                                checked={isCorrect}
                                onChange={() => handleCorrectAnswerSelect(qIdx, optIdx)}
                                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                              />
                            </label>

                            <span
                              className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                                isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {letter}
                            </span>

                            <input
                              type="text"
                              required
                              value={opt}
                              onChange={(e) =>
                                handleOptionChange(qIdx, optIdx, e.target.value)
                              }
                              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />

                            {q.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(qIdx, optIdx)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                                title="Delete option"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-bold text-slate-700">
                      Post-Submission Explanation <span className="text-slate-400 font-normal">(Educates learners why the answer is correct)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={q.explanation}
                      onChange={(e) =>
                        handleQuestionTextChange(qIdx, 'explanation', e.target.value)
                      }
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={handleAddQuestion}
              className="inline-flex items-center px-4 py-2 rounded-xl border-2 border-dashed border-indigo-300 text-indigo-600 hover:border-indigo-500 hover:bg-indigo-50 text-xs font-bold transition gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Question</span>
            </button>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200">
          <Link
            to="/admin/quizzes"
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-semibold transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-200 transition disabled:opacity-50 gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving Changes...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
