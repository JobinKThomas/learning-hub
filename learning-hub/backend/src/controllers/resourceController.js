import { resourceService } from '../services/resourceService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class ResourceController {
  constructor(service = resourceService) {
    this.service = service;
  }

  /**
   * @desc    Get all resources (optionally filtered by topic, type, or search)
   * @route   GET /api/resources?topic=:topicId&type=:type
   * @access  Private (Authenticated users)
   */
  getAll = async (req, res, next) => {
    try {
      const isAdmin = (req.user?.role || '').toUpperCase() === 'ADMIN';
      const topicId = req.query.topic || req.query.topicId;
      const { type, search } = req.query;

      const resources = await this.service.getAllResources({
        topicId,
        type,
        search,
        includeUnpublished: isAdmin,
      });

      return sendSuccess(res, 'Resources retrieved successfully', { resources, count: resources.length }, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Get resources for a specific topic
   * @route   GET /api/topics/:topicId/resources
   * @access  Private (Authenticated users)
   */
  getByTopic = async (req, res, next) => {
    try {
      const isAdmin = (req.user?.role || '').toUpperCase() === 'ADMIN';
      const { topicId } = req.params;
      const { type } = req.query;

      const resources = await this.service.getResourcesByTopic(topicId, {
        type,
        includeUnpublished: isAdmin,
      });

      return sendSuccess(res, 'Topic resources retrieved successfully', { resources, count: resources.length }, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Get resource by ID
   * @route   GET /api/resources/:id
   * @access  Private (Authenticated users)
   */
  getById = async (req, res, next) => {
    try {
      const resource = await this.service.getResourceById(req.params.id);
      return sendSuccess(res, 'Resource retrieved successfully', resource, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Create new resource
   * @route   POST /api/resources
   * @access  Private (Admin only)
   */
  create = async (req, res, next) => {
    try {
      const created = await this.service.createResource(req.body, req.user);
      return sendSuccess(res, 'Resource created successfully', created, 201);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Update resource
   * @route   PUT /api/resources/:id
   * @access  Private (Admin only)
   */
  update = async (req, res, next) => {
    try {
      const updated = await this.service.updateResource(req.params.id, req.body);
      return sendSuccess(res, 'Resource updated successfully', updated, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Delete resource
   * @route   DELETE /api/resources/:id
   * @access  Private (Admin only)
   */
  delete = async (req, res, next) => {
    try {
      const result = await this.service.deleteResource(req.params.id);
      return sendSuccess(res, 'Resource deleted successfully', result, 200);
    } catch (error) {
      next(error);
    }
  };
}

export const resourceController = new ResourceController();
export default resourceController;
