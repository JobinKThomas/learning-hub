import { learningPathRepository } from '../repositories/learningPathRepository.js';
import { learningPathPresenter } from '../presenters/learningPathPresenter.js';
import { ApiError } from '../utils/apiError.js';
import { slugify } from '../models/LearningPath.js';

export class LearningPathService {
  constructor(repository = learningPathRepository, presenter = learningPathPresenter) {
    this.repository = repository;
    this.presenter = presenter;
  }

  /**
   * Retrieve all learning paths with optional filtering
   */
  async getAllPaths({ category, level, search, includeUnpublished = false } = {}) {
    const filter = {};

    if (!includeUnpublished) {
      filter.published = { $ne: false };
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (level && level !== 'All') {
      filter.level = level;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    const paths = await this.repository.findAll(filter);
    return this.presenter.formatMany(paths);
  }

  /**
   * Retrieve a single learning path by its slug
   */
  async getPathBySlug(slug) {
    if (!slug) {
      throw new ApiError('Slug parameter is required', 400);
    }

    const path = await this.repository.findBySlug(slug);
    if (!path) {
      throw new ApiError(`Learning path not found with slug: '${slug}'`, 404);
    }

    return this.presenter.format(path);
  }

  /**
   * Retrieve a single learning path by its ID
   */
  async getPathById(id) {
    if (!id) {
      throw new ApiError('ID parameter is required', 400);
    }

    const path = await this.repository.findById(id);
    if (!path) {
      throw new ApiError(`Learning path not found with ID: '${id}'`, 404);
    }

    return this.presenter.format(path);
  }

  /**
   * Create a new learning path
   */
  async createPath(data, userId) {
    const targetSlug = data.slug ? slugify(data.slug) : slugify(data.title);

    const existing = await this.repository.findBySlug(targetSlug);
    if (existing) {
      throw new ApiError(`A learning path with slug '${targetSlug}' already exists`, 409);
    }

    const pathData = {
      ...data,
      slug: targetSlug,
      createdBy: userId,
    };

    const newPath = await this.repository.create(pathData);
    return this.presenter.format(newPath);
  }

  /**
   * Update an existing learning path by ID
   */
  async updatePath(id, data) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new ApiError(`Learning path not found with ID: '${id}'`, 404);
    }

    if (data.slug) {
      const newSlug = slugify(data.slug);
      if (newSlug !== existing.slug) {
        const slugOwner = await this.repository.findBySlug(newSlug);
        if (slugOwner && slugOwner._id.toString() !== id) {
          throw new ApiError(`A learning path with slug '${newSlug}' already exists`, 409);
        }
        data.slug = newSlug;
      }
    } else if (data.title && data.title !== existing.title && !data.slug) {
      const generatedSlug = slugify(data.title);
      const slugOwner = await this.repository.findBySlug(generatedSlug);
      if (slugOwner && slugOwner._id.toString() !== id) {
        throw new ApiError(`A learning path with slug '${generatedSlug}' already exists`, 409);
      }
      data.slug = generatedSlug;
    }

    const updated = await this.repository.update(id, data);
    return this.presenter.format(updated);
  }

  /**
   * Delete a learning path by ID
   */
  async deletePath(id) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new ApiError(`Learning path not found with ID: '${id}'`, 404);
    }

    await this.repository.delete(id);
    return { message: 'Learning path deleted successfully', id };
  }
}

export const learningPathService = new LearningPathService();
