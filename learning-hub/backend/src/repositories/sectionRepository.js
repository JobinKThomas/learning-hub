import { Section } from '../models/Section.js';

export class SectionRepository {
  /**
   * Find all sections matching filter and sort
   */
  async findAll(filter = {}, sort = { order: 1, createdAt: 1 }) {
    return await Section.find(filter)
      .populate({
        path: 'module',
        select: 'title slug duration order learningPath',
        populate: {
          path: 'learningPath',
          select: 'title slug category level',
        },
      })
      .populate('createdBy', 'name email role')
      .sort(sort)
      .exec();
  }

  /**
   * Find all sections belonging to a specific module
   */
  async findByModuleId(moduleId, filter = {}, sort = { order: 1, createdAt: 1 }) {
    return await Section.find({ module: moduleId, ...filter })
      .populate({
        path: 'module',
        select: 'title slug duration order learningPath',
        populate: {
          path: 'learningPath',
          select: 'title slug category level',
        },
      })
      .populate('createdBy', 'name email role')
      .sort(sort)
      .exec();
  }

  /**
   * Find a section by its slug
   */
  async findBySlug(slug) {
    return await Section.findOne({ slug: slug.toLowerCase().trim() })
      .populate({
        path: 'module',
        select: 'title slug duration order learningPath description',
        populate: {
          path: 'learningPath',
          select: 'title slug category level description',
        },
      })
      .populate('createdBy', 'name email role')
      .exec();
  }

  /**
   * Find a section by its MongoDB ID
   */
  async findById(id) {
    return await Section.findById(id)
      .populate({
        path: 'module',
        select: 'title slug duration order learningPath description',
        populate: {
          path: 'learningPath',
          select: 'title slug category level description',
        },
      })
      .populate('createdBy', 'name email role')
      .exec();
  }

  /**
   * Create a new section
   */
  async create(data) {
    return await Section.create(data);
  }

  /**
   * Update an existing section
   */
  async update(id, data) {
    return await Section.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
      .populate({
        path: 'module',
        select: 'title slug duration order learningPath description',
        populate: {
          path: 'learningPath',
          select: 'title slug category level description',
        },
      })
      .populate('createdBy', 'name email role');
  }

  /**
   * Delete a section by ID
   */
  async delete(id) {
    return await Section.findByIdAndDelete(id);
  }

  /**
   * Count sections matching filter
   */
  async count(filter = {}) {
    return await Section.countDocuments(filter);
  }
}

export const sectionRepository = new SectionRepository();
export default sectionRepository;
