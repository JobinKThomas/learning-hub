import mongoose from 'mongoose';
import { quizRepository } from '../repositories/quizRepository.js';
import { topicRepository } from '../repositories/topicRepository.js';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

async function resolveTopicId(topicIdentifier) {
  if (!topicIdentifier) return null;
  if (mongoose.Types.ObjectId.isValid(topicIdentifier)) {
    const topic = await topicRepository.findById(topicIdentifier);
    if (topic) return topic._id;
  }
  const topicBySlug = await topicRepository.findBySlug(topicIdentifier);
  if (topicBySlug) return topicBySlug._id;
  return null;
}

export const quizService = {
  getAllQuizzes: async (query = {}, user = null) => {
    const filter = {};
    const isAdmin = user && user.role === 'ADMIN';

    if (!isAdmin) {
      filter.published = true;
    }

    if (query.topic || query.topicId) {
      const topicId = await resolveTopicId(query.topic || query.topicId);
      if (!topicId) {
        return [];
      }
      filter.topic = topicId;
    }

    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ];
    }

    return quizRepository.findAll(filter);
  },

  getQuizzesByTopic: async (topicIdOrSlug, user = null) => {
    const topicId = await resolveTopicId(topicIdOrSlug);
    if (!topicId) {
      const err = new Error(`Topic '${topicIdOrSlug}' not found`);
      err.statusCode = 404;
      throw err;
    }

    const isAdmin = user && user.role === 'ADMIN';
    return quizRepository.findByTopic(topicId, !isAdmin);
  },

  getQuizById: async (id, user = null) => {
    let quiz = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      quiz = await quizRepository.findById(id);
    }
    if (!quiz) {
      quiz = await quizRepository.findBySlug(id);
    }

    if (!quiz) {
      const err = new Error(`Quiz '${id}' not found`);
      err.statusCode = 404;
      throw err;
    }

    const isAdmin = user && user.role === 'ADMIN';
    if (!quiz.published && !isAdmin) {
      const err = new Error(`Quiz '${id}' not found`);
      err.statusCode = 404;
      throw err;
    }

    return quiz;
  },

  /**
   * Evaluates submitted quiz answers securely against stored correct answers.
   * Calculates score, percentage, passing status, and itemized explanations.
   */
  submitQuiz: async (quizIdOrSlug, submittedAnswers = {}) => {
    let quiz = null;
    if (mongoose.Types.ObjectId.isValid(quizIdOrSlug)) {
      quiz = await quizRepository.findById(quizIdOrSlug);
    }
    if (!quiz) {
      quiz = await quizRepository.findBySlug(quizIdOrSlug);
    }

    if (!quiz) {
      const err = new Error(`Quiz '${quizIdOrSlug}' not found`);
      err.statusCode = 404;
      throw err;
    }

    // Normalize submitted answers into a map: questionId -> selectedOptionIndex
    const answerMap = {};
    if (Array.isArray(submittedAnswers)) {
      for (const item of submittedAnswers) {
        if (item.questionId !== undefined && item.selectedOption !== undefined) {
          answerMap[item.questionId.toString()] = Number(item.selectedOption);
        }
      }
    } else if (typeof submittedAnswers === 'object' && submittedAnswers !== null) {
      for (const [qId, selectedIdx] of Object.entries(submittedAnswers)) {
        if (selectedIdx !== undefined && selectedIdx !== null) {
          answerMap[qId.toString()] = Number(selectedIdx);
        }
      }
    }

    const questions = quiz.questions || [];
    let score = 0;
    const results = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qId = q._id.toString();
      const userAnswer = answerMap[qId];

      const isAnswered = userAnswer !== undefined && !isNaN(userAnswer);
      const isCorrect = isAnswered && userAnswer === q.correctAnswer;

      if (isCorrect) {
        score++;
      }

      results.push({
        questionIndex: i + 1,
        questionId: qId,
        question: q.question,
        options: q.options,
        codeSnippet: q.codeSnippet || '',
        selectedOption: isAnswered ? userAnswer : null,
        selectedOptionText: isAnswered && q.options[userAnswer] ? q.options[userAnswer] : null,
        correctAnswer: q.correctAnswer,
        correctAnswerText: q.options[q.correctAnswer] || null,
        isCorrect,
        explanation: q.explanation || '',
      });
    }

    const totalQuestions = questions.length;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const passingScore = quiz.passingScore ?? 70;
    const passed = percentage >= passingScore;

    return {
      quizId: quiz._id.toString(),
      title: quiz.title,
      slug: quiz.slug,
      score,
      totalQuestions,
      percentage,
      passingScore,
      passed,
      results,
    };
  },

  createQuiz: async (data, userId) => {
    const topicId = await resolveTopicId(data.topic || data.topicId);
    if (!topicId) {
      const err = new Error(`Topic '${data.topic || data.topicId}' not found`);
      err.statusCode = 404;
      throw err;
    }

    let slug = data.slug ? slugify(data.slug) : slugify(data.title);
    if (!slug) {
      slug = `quiz-${Date.now()}`;
    }

    // Ensure unique slug
    const existing = await quizRepository.findBySlug(slug);
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const payload = {
      ...data,
      topic: topicId,
      slug,
      createdBy: userId,
    };

    return quizRepository.create(payload);
  },

  updateQuiz: async (id, data) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error(`Invalid quiz ID: '${id}'`);
      err.statusCode = 400;
      throw err;
    }

    const existing = await quizRepository.findById(id);
    if (!existing) {
      const err = new Error(`Quiz with ID '${id}' not found`);
      err.statusCode = 404;
      throw err;
    }

    const updateData = { ...data };

    if (data.topic || data.topicId) {
      const topicId = await resolveTopicId(data.topic || data.topicId);
      if (!topicId) {
        const err = new Error(`Topic '${data.topic || data.topicId}' not found`);
        err.statusCode = 404;
        throw err;
      }
      updateData.topic = topicId;
      delete updateData.topicId;
    }

    if (data.slug && data.slug !== existing.slug) {
      updateData.slug = slugify(data.slug);
      const duplicate = await quizRepository.findBySlug(updateData.slug);
      if (duplicate && duplicate._id.toString() !== id) {
        const err = new Error(`Quiz with slug '${updateData.slug}' already exists`);
        err.statusCode = 409;
        throw err;
      }
    }

    return quizRepository.update(id, updateData);
  },

  deleteQuiz: async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error(`Invalid quiz ID: '${id}'`);
      err.statusCode = 400;
      throw err;
    }

    const existing = await quizRepository.findById(id);
    if (!existing) {
      const err = new Error(`Quiz with ID '${id}' not found`);
      err.statusCode = 404;
      throw err;
    }

    await quizRepository.delete(id);
    return { id, title: existing.title, slug: existing.slug };
  },
};
