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
   * Retrieve learning paths with search, filter, sort, and pagination
   */
  async getAllPaths({
    category,
    level,
    difficulty,
    status,
    published,
    search,
    sort = 'createdAt',
    order = 'desc',
    page = 1,
    limit = 10,
    includeUnpublished = false,
  } = {}) {
    const filter = {};

    // 1. Status / Published Filter
    if (!includeUnpublished) {
      filter.published = { $ne: false };
    } else {
      if (status) {
        const s = status.toLowerCase().trim();
        if (s === 'published') {
          filter.published = true;
        } else if (s === 'draft' || s === 'unpublished') {
          filter.published = false;
        }
      } else if (published !== undefined) {
        filter.published = String(published) === 'true';
      }
    }

    // 2. Category Filter
    if (category && category !== 'All') {
      filter.category = new RegExp(`^${category.trim()}$`, 'i');
    }

    // 3. Difficulty / Level Filter
    const targetLevel = level || difficulty;
    if (targetLevel && targetLevel !== 'All') {
      filter.level = new RegExp(`^${targetLevel.trim()}$`, 'i');
    }

    // 4. Search Filter
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { tags: searchRegex },
      ];
    }

    // 5. Sorting
    let sortField = sort;
    let sortDir = order === 'asc' || order === '1' || order === 1 ? 1 : -1;
    if (typeof sort === 'string') {
      if (sort.startsWith('-')) {
        sortField = sort.substring(1);
        sortDir = -1;
      } else if (sort.startsWith('+')) {
        sortField = sort.substring(1);
        sortDir = 1;
      }
    }

    const allowedSortFields = ['createdAt', 'title', 'level', 'order', 'category', 'updatedAt'];
    if (!allowedSortFields.includes(sortField)) {
      sortField = 'createdAt';
    }
    const sortObj = { [sortField]: sortDir };

    // 6. Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);

    const { paths, pagination } = await this.repository.findPaginated(
      filter,
      sortObj,
      pageNum,
      limitNum
    );

    return {
      paths: this.presenter.formatMany(paths),
      pagination,
    };
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
