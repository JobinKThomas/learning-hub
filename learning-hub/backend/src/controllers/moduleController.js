import { moduleService } from '../services/moduleService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class ModuleController {
  constructor(service = moduleService) {
    this.service = service;
  }

  /**
   * @desc    Get all modules (optionally filtered by learningPath or search)
   * @route   GET /api/modules
   * @access  Private (Authenticated users)
   */
  getAll = async (req, res, next) => {
    try {
      const isAdmin = (req.user?.role || '').toUpperCase() === 'ADMIN';
      const { learningPathId, search } = req.query;

      const modules = await this.service.getAllModules({
        learningPathId,
        search,
        includeUnpublished: isAdmin,
      });

      return sendSuccess(res, 'Modules retrieved successfully', { modules, count: modules.length }, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Get modules for a specific learning path
   * @route   GET /api/learning-paths/:learningPathId/modules
   * @access  Private (Authenticated users)
   */
  getByLearningPath = async (req, res, next) => {
    try {
      const isAdmin = (req.user?.role || '').toUpperCase() === 'ADMIN';
      const { learningPathId } = req.params;

      const modules = await this.service.getModulesByLearningPath(learningPathId, {
        includeUnpublished: isAdmin,
      });

      return sendSuccess(res, 'Learning path modules retrieved successfully', { modules, count: modules.length }, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Get module details by slug
   * @route   GET /api/modules/:slug
   * @access  Private (Authenticated users)
   */
  getBySlug = async (req, res, next) => {
    try {
      const mod = await this.service.getModuleBySlug(req.params.slug);
      return sendSuccess(res, 'Module details retrieved successfully', mod, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Get module by ID (Admin)
   * @route   GET /api/modules/id/:id
   * @access  Private (Authenticated users)
   */
  getById = async (req, res, next) => {
    try {
      const mod = await this.service.getModuleById(req.params.id);
      return sendSuccess(res, 'Module retrieved successfully', mod, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Create new module
   * @route   POST /api/modules
   * @access  Private (Admin only)
   */
  create = async (req, res, next) => {
    try {
      const created = await this.service.createModule(req.body, req.user);
      return sendSuccess(res, 'Module created successfully', created, 201);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Update module
   * @route   PUT /api/modules/:id
   * @access  Private (Admin only)
   */
  update = async (req, res, next) => {
    try {
      const updated = await this.service.updateModule(req.params.id, req.body);
      return sendSuccess(res, 'Module updated successfully', updated, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Delete module
   * @route   DELETE /api/modules/:id
   * @access  Private (Admin only)
   */
  delete = async (req, res, next) => {
    try {
      const result = await this.service.deleteModule(req.params.id);
      return sendSuccess(res, 'Module deleted successfully', result, 200);
    } catch (error) {
      next(error);
    }
  };
}

export const moduleController = new ModuleController();
export default moduleController;
