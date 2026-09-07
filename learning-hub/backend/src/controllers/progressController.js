import { progressService } from '../services/progressService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const progressController = {
  /**
   * Update progress for a topic / note / quiz / playground
   * @route POST /api/progress
   */
  updateProgress: async (req, res, next) => {
    try {
      const result = await progressService.updateProgress(
        req.user._id,
        req.body
      );
      return sendSuccess(res, 'Progress updated successfully', result, 200);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get overarching user learning progress
   * @route GET /api/progress
   */
  getOverallProgress: async (req, res, next) => {
    try {
      const result = await progressService.getOverallProgress(req.user._id);
      return sendSuccess(
        res,
        'Overall progress retrieved successfully',
        result,
        200
      );
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get progress for a specific topic
   * @route GET /api/progress/topic/:topicId
   */
  getTopicProgress: async (req, res, next) => {
    try {
      const { topicId } = req.params;
      const result = await progressService.getTopicProgress(
        req.user._id,
        topicId
      );
      return sendSuccess(
        res,
        'Topic progress retrieved successfully',
        result,
        200
      );
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get progress for a specific learning path
   * @route GET /api/progress/learning-path/:id
   */
  getLearningPathProgress: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await progressService.getLearningPathProgress(
        req.user._id,
        id
      );
      return sendSuccess(
        res,
        'Learning path progress retrieved successfully',
        result,
        200
      );
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get progress for a specific module
   * @route GET /api/progress/module/:id
   */
  getModuleProgress: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await progressService.getModuleProgress(req.user._id, id);
      return sendSuccess(
        res,
        'Module progress retrieved successfully',
        result,
        200
      );
    } catch (err) {
      next(err);
    }
  },
};

export default progressController;
