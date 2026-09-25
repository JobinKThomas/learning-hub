import { LearningPath } from '../models/LearningPath.js';

export class LearningPathRepository {
  /**
   * Find all learning paths with optional filters and sorting
   */
  async findAll(filter = {}, sort = { createdAt: -1 }) {
    return await LearningPath.find(filter)
      .populate('createdBy', 'name email role')
      .sort(sort)
      .exec();
  }

  /**
   * Find paginated learning paths with filter, sort, page, and limit
   */
  async findPaginated(filter = {}, sort = { createdAt: -1 }, page = 1, limit = 10) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const [paths, total] = await Promise.all([
      LearningPath.find(filter)
        .populate('createdBy', 'name email role')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .exec(),
      LearningPath.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return {
      paths,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    };
  }

  /**
   * Find a learning path by its unique slug
   */
  async findBySlug(slug) {
    return await LearningPath.findOne({ slug: slug.toLowerCase().trim() })
      .populate('createdBy', 'name email role')
      .exec();
  }

  /**
   * Find a learning path by its ID
   */
  async findById(id) {
    return await LearningPath.findById(id)
      .populate('createdBy', 'name email role')
      .exec();
  }

  /**
   * Create a new learning path
   */
  async create(data) {
    return await LearningPath.create(data);
  }

  /**
   * Update an existing learning path by ID
   */
  async update(id, data) {
    return await LearningPath.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate('createdBy', 'name email role');
  }

  /**
   * Delete a learning path by ID
   */
  async delete(id) {
    return await LearningPath.findByIdAndDelete(id);
  }

  /**
   * Count paths matching filter
   */
  async count(filter = {}) {
    return await LearningPath.countDocuments(filter);
  }
}

export const learningPathRepository = new LearningPathRepository();
