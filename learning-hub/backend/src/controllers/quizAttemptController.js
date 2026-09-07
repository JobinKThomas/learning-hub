import { quizAttemptService } from '../services/quizAttemptService.js';
import { quizAttemptPresenter } from '../presenters/quizAttemptPresenter.js';

export const quizAttemptController = {
  createAttempt: async (req, res, next) => {
    try {
      const { id } = req.params;
      const attempt = await quizAttemptService.createAttempt(req.user._id, id, req.body);

      return res.status(201).json({
        success: true,
        message: 'Quiz attempt recorded and evaluated successfully',
        data: quizAttemptPresenter.toResponse(attempt),
      });
    } catch (err) {
      next(err);
    }
  },

  getQuizAttempts: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await quizAttemptService.getAttemptsByQuiz(id, req.user, req.query);

      return res.status(200).json({
        success: true,
        data: {
          quiz: result.quiz,
          stats: quizAttemptPresenter.toStatsResponse(result.stats),
          attempts: quizAttemptPresenter.toResponseList(result.attempts),
        },
      });
    } catch (err) {
      next(err);
    }
  },

  getAllAttempts: async (req, res, next) => {
    try {
      const result = await quizAttemptService.getUserAttempts(req.user, req.query);

      return res.status(200).json({
        success: true,
        data: {
          attempts: quizAttemptPresenter.toResponseList(result.attempts),
          total: result.total,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  getAttemptById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const attempt = await quizAttemptService.getAttemptById(id, req.user);

      return res.status(200).json({
        success: true,
        data: quizAttemptPresenter.toResponse(attempt),
      });
    } catch (err) {
      next(err);
    }
  },
};
