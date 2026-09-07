import mongoose from 'mongoose';
import { resourceRepository } from '../repositories/resourceRepository.js';
import { topicRepository } from '../repositories/topicRepository.js';
import { resourcePresenter } from '../presenters/resourcePresenter.js';
import { ApiError } from '../utils/apiError.js';

export class ResourceService {
  constructor(
    repository = resourceRepository,
    topicRepo = topicRepository,
    presenter = resourcePresenter
  ) {
    this.repository = repository;
    this.topicRepo = topicRepo;
    this.presenter = presenter;
  }

  /**
   * Helper to resolve parent topic by MongoDB ID or slug
   */
  async resolveTopic(identifier) {
    if (!identifier) return null;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      const topicById = await this.topicRepo.findById(identifier);
      if (topicById) return topicById;
    }

    return await this.topicRepo.findBySlug(identifier);
  }

  /**
   * Retrieve all resources with optional filtering (by topic, type, search query, or publication)
   */
  async getAllResources({ topicId, type, search, includeUnpublished = false } = {}) {
    const filter = {};

    if (!includeUnpublished) {
      filter.published = { $ne: false };
    }

    if (topicId) {
      const resolvedTopic = await this.resolveTopic(topicId);
      if (resolvedTopic) {
        filter.topic = resolvedTopic._id;
      } else {
        return [];
      }
    }

    if (type) {
      filter.type = type.toUpperCase().trim();
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { author: searchRegex },
      ];
    }

    const resources = await this.repository.findAll(filter);
    return this.presenter.formatMany(resources);
  }

  /**
   * Retrieve resources for a specific topic (by ID or slug)
   */
  async getResourcesByTopic(topicIdentifier, { type, includeUnpublished = false } = {}) {
    if (!topicIdentifier) {
      throw new ApiError('Topic identifier is required', 400);
    }

    const resolvedTopic = await this.resolveTopic(topicIdentifier);
    if (!resolvedTopic) {
      throw new ApiError(`Parent topic not found: '${topicIdentifier}'`, 404);
    }

    const filter = {};
    if (!includeUnpublished) {
      filter.published = { $ne: false };
    }

    if (type) {
      filter.type = type.toUpperCase().trim();
    }

    const resources = await this.repository.findByTopicId(resolvedTopic._id, filter);
    return this.presenter.formatMany(resources);
  }

  /**
   * Retrieve a single resource by MongoDB ID
   */
  async getResourceById(id) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError('Invalid resource ID format', 400);
    }

    const resource = await this.repository.findById(id);
    if (!resource) {
      throw new ApiError(`Resource not found with ID: '${id}'`, 404);
    }

    return this.presenter.format(resource);
  }

  /**
   * Create a new resource (Admin only)
   */
  async createResource(data, user = null) {
    const topicIdentifier = data.topic || data.topicId;
    if (!topicIdentifier) {
      throw new ApiError('Parent topic identifier is required', 400);
    }

    const resolvedTopic = await this.resolveTopic(topicIdentifier);
    if (!resolvedTopic) {
      throw new ApiError(`Referenced topic not found: '${topicIdentifier}'`, 404);
    }

    const newResourceData = {
      ...data,
      topic: resolvedTopic._id,
      createdBy: user?._id || user?.id,
    };

    const created = await this.repository.create(newResourceData);
    return this.presenter.format(created);
  }

  /**
   * Update an existing resource by ID (Admin only)
   */
  async updateResource(id, data) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError('Invalid resource ID format', 400);
    }

    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new ApiError(`Resource not found with ID: '${id}'`, 404);
    }

    const updateData = { ...data };

    if (updateData.topic || updateData.topicId) {
      const topicIdentifier = updateData.topic || updateData.topicId;
      const resolvedTopic = await this.resolveTopic(topicIdentifier);
      if (!resolvedTopic) {
        throw new ApiError(`Referenced topic not found: '${topicIdentifier}'`, 404);
      }
      updateData.topic = resolvedTopic._id;
      delete updateData.topicId;
    }

    const updated = await this.repository.update(id, updateData);
    return this.presenter.format(updated);
  }

  /**
   * Delete a resource by ID (Admin only)
   */
  async deleteResource(id) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError('Invalid resource ID format', 400);
    }

    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new ApiError(`Resource not found with ID: '${id}'`, 404);
    }

    await this.repository.delete(id);
    return { id, title: existing.title };
  }
}

export const resourceService = new ResourceService();
export default resourceService;
