import mongoose from 'mongoose';
import { quizAttemptRepository } from '../repositories/quizAttemptRepository.js';
import { quizRepository } from '../repositories/quizRepository.js';
import { progressService } from './progressService.js';

async function resolveQuiz(quizIdOrSlug) {
  if (!quizIdOrSlug) return null;
  if (mongoose.Types.ObjectId.isValid(quizIdOrSlug)) {
    const q = await quizRepository.findById(quizIdOrSlug);
    if (q) return q;
  }
  return quizRepository.findBySlug(quizIdOrSlug);
}

export const quizAttemptService = {
  createAttempt: async (userId, quizIdOrSlug, data = {}) => {
    const quiz = await resolveQuiz(quizIdOrSlug);
    if (!quiz) {
      const err = new Error(`Quiz '${quizIdOrSlug}' not found`);
      err.statusCode = 404;
      throw err;
    }

    const submittedAnswers = data.answers || {};
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
    const snapshottedAnswers = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qId = q._id.toString();
      const userAnswer = answerMap[qId];

      const isAnswered = userAnswer !== undefined && !isNaN(userAnswer);
      const isCorrect = isAnswered && userAnswer === q.correctAnswer;

      if (isCorrect) {
        score++;
      }

      snapshottedAnswers.push({
        questionId: q._id,
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

    // Calculate sequential attempt number for this user and quiz
    const existingAttemptsCount = await quizAttemptRepository.countAttempts(userId, quiz._id);
    const attemptNumber = existingAttemptsCount + 1;

    const timeSpentSeconds = Number(data.timeSpentSeconds) || 0;
    const startedAt = data.startedAt ? new Date(data.startedAt) : new Date(Date.now() - (timeSpentSeconds * 1000));
    const completedAt = new Date();

    const created = await quizAttemptRepository.create({
      user: userId,
      quiz: quiz._id,
      attemptNumber,
      answers: snapshottedAnswers,
      score,
      totalQuestions,
      percentage,
      passingScore,
      passed,
      timeSpentSeconds,
      startedAt,
      completedAt,
    });

    if (passed && quiz.topic) {
      try {
        await progressService.updateProgress(userId, {
          topicId: quiz.topic._id || quiz.topic,
          quizId: quiz._id,
          completed: true,
        });
      } catch (err) {
        // Non-blocking progress sync
      }
    }

    return quizAttemptRepository.findById(created._id);
  },

  getAttemptsByQuiz: async (quizIdOrSlug, currentUser, query = {}) => {
    const quiz = await resolveQuiz(quizIdOrSlug);
    if (!quiz) {
      const err = new Error(`Quiz '${quizIdOrSlug}' not found`);
      err.statusCode = 404;
      throw err;
    }

    const isAdmin = currentUser && currentUser.role === 'ADMIN';
    let targetUserId = currentUser._id;

    if (isAdmin && query.user) {
      targetUserId = query.user;
    }

    const [attempts, stats] = await Promise.all([
      quizAttemptRepository.findByUserAndQuiz(targetUserId, quiz._id),
      quizAttemptRepository.getQuizStats(targetUserId, quiz._id),
    ]);

    return {
      quiz: {
        id: quiz._id.toString(),
        title: quiz.title,
        slug: quiz.slug,
        passingScore: quiz.passingScore,
        timeLimitMinutes: quiz.timeLimitMinutes,
      },
      stats,
      attempts,
    };
  },

  getUserAttempts: async (currentUser, query = {}) => {
    const isAdmin = currentUser && currentUser.role === 'ADMIN';
    let targetUserId = currentUser._id;

    if (isAdmin && query.user) {
      targetUserId = query.user;
    }

    const options = {
      limit: Number(query.limit) || 50,
      skip: Number(query.skip) || 0,
    };

    const attempts = await quizAttemptRepository.findByUser(targetUserId, options);
    const total = await quizAttemptRepository.countTotal({ user: targetUserId });

    return {
      attempts,
      total,
    };
  },

  getAttemptById: async (attemptId, currentUser) => {
    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      const err = new Error(`Invalid quiz attempt ID: '${attemptId}'`);
      err.statusCode = 400;
      throw err;
    }

    const attempt = await quizAttemptRepository.findById(attemptId);
    if (!attempt) {
      const err = new Error(`Quiz attempt '${attemptId}' not found`);
      err.statusCode = 404;
      throw err;
    }

    const isAdmin = currentUser && currentUser.role === 'ADMIN';
    const isOwner = attempt.user && (
      (attempt.user._id && attempt.user._id.toString() === currentUser._id.toString()) ||
      (attempt.user.id && attempt.user.id.toString() === currentUser._id.toString()) ||
      (attempt.user.toString() === currentUser._id.toString())
    );

    if (!isOwner && !isAdmin) {
      const err = new Error('You do not have permission to view this quiz attempt');
      err.statusCode = 403;
      throw err;
    }

    return attempt;
  },
};
