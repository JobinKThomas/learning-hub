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
