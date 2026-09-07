import { learningPathService } from '../services/learningPathService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class LearningPathController {
  constructor(service = learningPathService) {
    this.service = service;
  }

  /**
   * @desc    Get all published learning paths (or all if admin)
   * @route   GET /api/learning-paths
   * @access  Private (Authenticated users)
   */
  getAll = async (req, res, next) => {
    try {
      const isAdmin = (req.user?.role || '').toUpperCase() === 'ADMIN';
      const { category, level, search } = req.query;

      const paths = await this.service.getAllPaths({
        category,
        level,
        search,
        includeUnpublished: isAdmin,
      });

      return sendSuccess(res, 'Learning paths retrieved successfully', { paths, count: paths.length }, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Get learning path details by slug
   * @route   GET /api/learning-paths/:slug
   * @access  Private (Authenticated users)
   */
  getBySlug = async (req, res, next) => {
    try {
      const path = await this.service.getPathBySlug(req.params.slug);
      return sendSuccess(res, 'Learning path details retrieved successfully', path, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Get learning path by ID (useful for edit forms)
   * @route   GET /api/learning-paths/id/:id
   * @access  Private (Admin only)
   */
  getById = async (req, res, next) => {
    try {
      const path = await this.service.getPathById(req.params.id);
      return sendSuccess(res, 'Learning path retrieved successfully', path, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Create a new learning path
   * @route   POST /api/learning-paths
   * @access  Private (Admin only)
   */
  create = async (req, res, next) => {
    try {
      const newPath = await this.service.createPath(req.body, req.user._id);
      return sendSuccess(res, 'Learning path created successfully', newPath, 201);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Update a learning path by ID
   * @route   PUT /api/learning-paths/:id
   * @access  Private (Admin only)
   */
  update = async (req, res, next) => {
    try {
      const updatedPath = await this.service.updatePath(req.params.id, req.body);
      return sendSuccess(res, 'Learning path updated successfully', updatedPath, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Delete a learning path by ID
   * @route   DELETE /api/learning-paths/:id
   * @access  Private (Admin only)
   */
  remove = async (req, res, next) => {
    try {
      const result = await this.service.deletePath(req.params.id);
      return sendSuccess(res, 'Learning path deleted successfully', result, 200);
    } catch (error) {
      next(error);
    }
  };
}

export const learningPathController = new LearningPathController();
