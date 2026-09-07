import { Topic } from '../models/Topic.js';

export class TopicRepository {
  /**
   * Helper to build populated query
   */
  #buildPopulate(query) {
    return query
      .populate({
        path: 'section',
        select: 'title slug order duration module',
        populate: {
          path: 'module',
          select: 'title slug order duration learningPath',
          populate: {
            path: 'learningPath',
            select: 'title slug category level',
          },
        },
      })
      .populate('createdBy', 'name email role');
  }

  /**
   * Find all topics matching filter and sort
   */
  async findAll(filter = {}, sort = { order: 1, createdAt: 1 }) {
    return await this.#buildPopulate(Topic.find(filter).sort(sort)).exec();
  }

  /**
   * Find all topics belonging to a specific section
   */
  async findBySectionId(sectionId, filter = {}, sort = { order: 1, createdAt: 1 }) {
    return await this.#buildPopulate(Topic.find({ section: sectionId, ...filter }).sort(sort)).exec();
  }

  /**
   * Find a topic by its slug
   */
  async findBySlug(slug) {
    return await this.#buildPopulate(Topic.findOne({ slug: slug.toLowerCase().trim() })).exec();
  }

  /**
   * Find a topic by its MongoDB ID
   */
  async findById(id) {
    return await this.#buildPopulate(Topic.findById(id)).exec();
  }

  /**
   * Create a new topic
   */
  async create(data) {
    return await Topic.create(data);
  }

  /**
   * Update an existing topic
   */
  async update(id, data) {
    return await Topic.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
      .populate({
        path: 'section',
        select: 'title slug order duration module',
        populate: {
          path: 'module',
          select: 'title slug order duration learningPath',
          populate: {
            path: 'learningPath',
            select: 'title slug category level',
          },
        },
      })
      .populate('createdBy', 'name email role');
  }

  /**
   * Delete a topic by ID
   */
  async delete(id) {
    return await Topic.findByIdAndDelete(id);
  }

  /**
   * Count topics matching filter
   */
  async count(filter = {}) {
    return await Topic.countDocuments(filter);
  }
}

export const topicRepository = new TopicRepository();
export default topicRepository;
