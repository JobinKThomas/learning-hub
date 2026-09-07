import { QuizAttempt } from '../models/QuizAttempt.js';

export const quizAttemptRepository = {
  create: async (attemptData) => {
    const attempt = new QuizAttempt(attemptData);
    return attempt.save();
  },

  findById: async (id) => {
    return QuizAttempt.findById(id)
      .populate({
        path: 'quiz',
        select: 'title slug description passingScore timeLimitMinutes topic',
        populate: {
          path: 'topic',
          select: 'title slug section',
          populate: {
            path: 'section',
            select: 'title slug module',
            populate: {
              path: 'module',
              select: 'title slug learningPath',
              populate: {
                path: 'learningPath',
                select: 'title slug',
              },
            },
          },
        },
      })
      .populate('user', 'name email role');
  },

  findByUserAndQuiz: async (userId, quizId, options = {}) => {
    const { limit = 50, skip = 0, sort = { attemptNumber: -1 } } = options;

    return QuizAttempt.find({ user: userId, quiz: quizId })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('quiz', 'title slug passingScore timeLimitMinutes')
      .populate('user', 'name email');
  },

  findByUser: async (userId, options = {}) => {
    const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;

    return QuizAttempt.find({ user: userId })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'quiz',
        select: 'title slug passingScore topic',
        populate: {
          path: 'topic',
          select: 'title slug',
        },
      })
      .populate('user', 'name email');
  },

  findAll: async (filter = {}, options = {}) => {
    const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;

    return QuizAttempt.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('quiz', 'title slug passingScore')
      .populate('user', 'name email');
  },

  countAttempts: async (userId, quizId) => {
    return QuizAttempt.countDocuments({ user: userId, quiz: quizId });
  },

  countTotal: async (filter = {}) => {
    return QuizAttempt.countDocuments(filter);
  },

  getQuizStats: async (userId, quizId) => {
    const attempts = await QuizAttempt.find({ user: userId, quiz: quizId })
      .select('score totalQuestions percentage passed attemptNumber createdAt timeSpentSeconds')
      .sort({ attemptNumber: 1 });

    if (!attempts || attempts.length === 0) {
      return {
        totalAttempts: 0,
        bestScore: 0,
        bestPercentage: 0,
        hasPassed: false,
        latestAttempt: null,
      };
    }

    let bestScore = 0;
    let bestPercentage = 0;
    let hasPassed = false;

    for (const att of attempts) {
      if (att.score > bestScore) bestScore = att.score;
      if (att.percentage > bestPercentage) bestPercentage = att.percentage;
      if (att.passed) hasPassed = true;
    }

    const latest = attempts[attempts.length - 1];

    return {
      totalAttempts: attempts.length,
      bestScore,
      bestPercentage,
      hasPassed,
      latestAttempt: {
        id: latest._id,
        attemptNumber: latest.attemptNumber,
        score: latest.score,
        totalQuestions: latest.totalQuestions,
        percentage: latest.percentage,
        passed: latest.passed,
        timeSpentSeconds: latest.timeSpentSeconds,
        createdAt: latest.createdAt,
      },
    };
  },
};
