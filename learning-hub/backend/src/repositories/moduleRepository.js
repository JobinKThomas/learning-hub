import { Module } from '../models/Module.js';

export class ModuleRepository {
  /**
   * Find all modules matching filter and sort
   */
  async findAll(filter = {}, sort = { order: 1, createdAt: 1 }) {
    return await Module.find(filter)
      .populate('learningPath', 'title slug category level')
      .populate('createdBy', 'name email role')
      .sort(sort)
      .exec();
  }

  /**
   * Find all modules belonging to a specific learning path
   */
  async findByLearningPathId(learningPathId, filter = {}, sort = { order: 1, createdAt: 1 }) {
    return await Module.find({ learningPath: learningPathId, ...filter })
      .populate('learningPath', 'title slug category level')
      .populate('createdBy', 'name email role')
      .sort(sort)
      .exec();
  }

  /**
   * Find a module by its slug
   */
  async findBySlug(slug) {
    return await Module.findOne({ slug: slug.toLowerCase().trim() })
      .populate('learningPath', 'title slug category level description')
      .populate('createdBy', 'name email role')
      .exec();
  }

  /**
   * Find a module by its MongoDB ID
   */
  async findById(id) {
    return await Module.findById(id)
      .populate('learningPath', 'title slug category level description')
      .populate('createdBy', 'name email role')
      .exec();
  }

  /**
   * Create a new module
   */
  async create(data) {
    return await Module.create(data);
  }

  /**
   * Update an existing module
   */
  async update(id, data) {
    return await Module.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
      .populate('learningPath', 'title slug category level description')
      .populate('createdBy', 'name email role');
  }

  /**
   * Delete a module by ID
   */
  async delete(id) {
    return await Module.findByIdAndDelete(id);
  }

  /**
   * Count modules matching filter
   */
  async count(filter = {}) {
    return await Module.countDocuments(filter);
  }
}

export const moduleRepository = new ModuleRepository();
export default moduleRepository;
