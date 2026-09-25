import { quizService } from '../services/quizService.js';
import { quizPresenter } from '../presenters/quizPresenter.js';

export const quizController = {
  getAll: async (req, res, next) => {
    try {
      const quizzes = await quizService.getAllQuizzes(req.query, req.user);
      const isAdmin = req.user && req.user.role === 'ADMIN';
      return res.status(200).json({
        success: true,
        data: {
          quizzes: quizPresenter.toResponseList(quizzes, { includeAnswers: isAdmin }),
          count: quizzes.length,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  getByTopic: async (req, res, next) => {
    try {
      const { topicId } = req.params;
      const quizzes = await quizService.getQuizzesByTopic(topicId, req.user);
      const isAdmin = req.user && req.user.role === 'ADMIN';
      return res.status(200).json({
        success: true,
        data: {
          quizzes: quizPresenter.toResponseList(quizzes, { includeAnswers: isAdmin }),
          count: quizzes.length,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const quiz = await quizService.getQuizById(id, req.user);
      const isAdmin = req.user && req.user.role === 'ADMIN';
      const includeAnswers = isAdmin && req.query.mode === 'edit';

      return res.status(200).json({
        success: true,
        data: quizPresenter.toResponse(quiz, { includeAnswers }),
      });
    } catch (err) {
      next(err);
    }
  },

  submitQuiz: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { answers } = req.body;

      const evaluation = await quizService.submitQuiz(id, answers);
      return res.status(200).json({
        success: true,
        message: 'Quiz evaluated successfully',
        data: evaluation,
      });
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const quiz = await quizService.createQuiz(req.body, req.user.id);
      return res.status(201).json({
        success: true,
        message: 'Quiz created successfully',
        data: quizPresenter.toResponse(quiz, { includeAnswers: true }),
      });
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const quiz = await quizService.updateQuiz(id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Quiz updated successfully',
        data: quizPresenter.toResponse(quiz, { includeAnswers: true }),
      });
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await quizService.deleteQuiz(id);
      return res.status(200).json({
        success: true,
        message: 'Quiz deleted successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },
};
