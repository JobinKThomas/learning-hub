import { sectionService } from '../services/sectionService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class SectionController {
  constructor(service = sectionService) {
    this.service = service;
  }

  /**
   * @desc    Get all sections (optionally filtered by module or search)
   * @route   GET /api/sections
   * @access  Private (Authenticated users)
   */
  getAll = async (req, res, next) => {
    try {
      const isAdmin = (req.user?.role || '').toUpperCase() === 'ADMIN';
      const { moduleId, search } = req.query;

      const sections = await this.service.getAllSections({
        moduleId,
        search,
        includeUnpublished: isAdmin,
      });

      return sendSuccess(res, 'Sections retrieved successfully', { sections, count: sections.length }, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Get sections for a specific module
   * @route   GET /api/modules/:moduleId/sections
   * @access  Private (Authenticated users)
   */
  getByModule = async (req, res, next) => {
    try {
      const isAdmin = (req.user?.role || '').toUpperCase() === 'ADMIN';
      const { moduleId } = req.params;

      const sections = await this.service.getSectionsByModule(moduleId, {
        includeUnpublished: isAdmin,
      });

      return sendSuccess(res, 'Module sections retrieved successfully', { sections, count: sections.length }, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Get section details by slug
   * @route   GET /api/sections/:slug
   * @access  Private (Authenticated users)
   */
  getBySlug = async (req, res, next) => {
    try {
      const section = await this.service.getSectionBySlug(req.params.slug);
      return sendSuccess(res, 'Section details retrieved successfully', section, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Get section by ID
   * @route   GET /api/sections/id/:id
   * @access  Private (Authenticated users)
   */
  getById = async (req, res, next) => {
    try {
      const section = await this.service.getSectionById(req.params.id);
      return sendSuccess(res, 'Section retrieved successfully', section, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Create new section
   * @route   POST /api/sections
   * @access  Private (Admin only)
   */
  create = async (req, res, next) => {
    try {
      const created = await this.service.createSection(req.body, req.user);
      return sendSuccess(res, 'Section created successfully', created, 201);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Update section
   * @route   PUT /api/sections/:id
   * @access  Private (Admin only)
   */
  update = async (req, res, next) => {
    try {
      const updated = await this.service.updateSection(req.params.id, req.body);
      return sendSuccess(res, 'Section updated successfully', updated, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Delete section
   * @route   DELETE /api/sections/:id
   * @access  Private (Admin only)
   */
  delete = async (req, res, next) => {
    try {
      const result = await this.service.deleteSection(req.params.id);
      return sendSuccess(res, 'Section deleted successfully', result, 200);
    } catch (error) {
      next(error);
    }
  };
}

export const sectionController = new SectionController();
export default sectionController;
