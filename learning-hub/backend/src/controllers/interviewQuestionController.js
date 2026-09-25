import { interviewQuestionService } from '../services/interviewQuestionService.js';
import { interviewQuestionPresenter } from '../presenters/interviewQuestionPresenter.js';

export const interviewQuestionController = {
  getAll: async (req, res, next) => {
    try {
      const questions = await interviewQuestionService.getAllQuestions(req.query, req.user);
      return res.status(200).json({
        success: true,
        data: interviewQuestionPresenter.toResponseList(questions),
        count: questions.length,
      });
    } catch (err) {
      next(err);
    }
  },

  getByTopic: async (req, res, next) => {
    try {
      const { topicId } = req.params;
      const questions = await interviewQuestionService.getQuestionsByTopic(topicId, req.user);
      return res.status(200).json({
        success: true,
        data: interviewQuestionPresenter.toResponseList(questions),
        count: questions.length,
      });
    } catch (err) {
      next(err);
    }
  },

  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const question = await interviewQuestionService.getQuestionById(id, req.user);
      return res.status(200).json({
        success: true,
        data: interviewQuestionPresenter.toResponse(question),
      });
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const created = await interviewQuestionService.createQuestion(req.body, req.user._id);
      return res.status(201).json({
        success: true,
        message: 'Interview question created successfully',
        data: interviewQuestionPresenter.toResponse(created),
      });
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updated = await interviewQuestionService.updateQuestion(id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Interview question updated successfully',
        data: interviewQuestionPresenter.toResponse(updated),
      });
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleted = await interviewQuestionService.deleteQuestion(id);
      return res.status(200).json({
        success: true,
        message: 'Interview question deleted successfully',
        data: deleted,
      });
    } catch (err) {
      next(err);
    }
  },
};
