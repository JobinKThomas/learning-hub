import { topicService } from '../services/topicService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class TopicController {
  constructor(service = topicService) {
    this.service = service;
  }

  /**
   * @desc    Get all topics (optionally filtered by section or search)
   * @route   GET /api/topics?section=:sectionId
   * @access  Private (Authenticated users)
   */
  getAll = async (req, res, next) => {
    try {
      const isAdmin = (req.user?.role || '').toUpperCase() === 'ADMIN';
      const sectionId = req.query.section || req.query.sectionId;
      const { search } = req.query;

      const topics = await this.service.getAllTopics({
        sectionId,
        search,
        includeUnpublished: isAdmin,
      });

      return sendSuccess(res, 'Topics retrieved successfully', { topics, count: topics.length }, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Get topics for a specific section
   * @route   GET /api/sections/:sectionId/topics
   * @access  Private (Authenticated users)
   */
  getBySection = async (req, res, next) => {
    try {
      const isAdmin = (req.user?.role || '').toUpperCase() === 'ADMIN';
      const { sectionId } = req.params;

      const topics = await this.service.getTopicsBySection(sectionId, {
        includeUnpublished: isAdmin,
      });

      return sendSuccess(res, 'Section topics retrieved successfully', { topics, count: topics.length }, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Get topic details by slug
   * @route   GET /api/topics/:slug
   * @access  Private (Authenticated users)
   */
  getBySlug = async (req, res, next) => {
    try {
      const topic = await this.service.getTopicBySlug(req.params.slug);
      return sendSuccess(res, 'Topic details retrieved successfully', topic, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Get topic by ID
   * @route   GET /api/topics/id/:id
   * @access  Private (Authenticated users)
   */
  getById = async (req, res, next) => {
    try {
      const topic = await this.service.getTopicById(req.params.id);
      return sendSuccess(res, 'Topic retrieved successfully', topic, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Create new topic
   * @route   POST /api/topics
   * @access  Private (Admin only)
   */
  create = async (req, res, next) => {
    try {
      const created = await this.service.createTopic(req.body, req.user);
      return sendSuccess(res, 'Topic created successfully', created, 201);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Update topic
   * @route   PUT /api/topics/:id
   * @access  Private (Admin only)
   */
  update = async (req, res, next) => {
    try {
      const updated = await this.service.updateTopic(req.params.id, req.body);
      return sendSuccess(res, 'Topic updated successfully', updated, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Delete topic
   * @route   DELETE /api/topics/:id
   * @access  Private (Admin only)
   */
  delete = async (req, res, next) => {
    try {
      const result = await this.service.deleteTopic(req.params.id);
      return sendSuccess(res, 'Topic deleted successfully', result, 200);
    } catch (error) {
      next(error);
    }
  };
}

export const topicController = new TopicController();
export default topicController;
