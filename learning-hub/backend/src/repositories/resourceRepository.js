import { Resource } from '../models/Resource.js';

export class ResourceRepository {
  /**
   * Helper to build populated query across all curriculum tiers
   */
  #buildPopulate(query) {
    return query
      .populate({
        path: 'topic',
        select: 'title slug summary duration order section',
        populate: {
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
        },
      })
      .populate('createdBy', 'name email role');
  }

  /**
   * Find all resources matching filter and sort
   */
  async findAll(filter = {}, sort = { order: 1, createdAt: 1 }) {
    return await this.#buildPopulate(Resource.find(filter).sort(sort)).exec();
  }

  /**
   * Find all resources belonging to a specific topic
   */
  async findByTopicId(topicId, filter = {}, sort = { order: 1, createdAt: 1 }) {
    return await this.#buildPopulate(Resource.find({ topic: topicId, ...filter }).sort(sort)).exec();
  }

  /**
   * Find a resource by its MongoDB ID
   */
  async findById(id) {
    return await this.#buildPopulate(Resource.findById(id)).exec();
  }

  /**
   * Create a new resource
   */
  async create(data) {
    return await Resource.create(data);
  }

  /**
   * Update an existing resource
   */
  async update(id, data) {
    return await Resource.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
      .populate({
        path: 'topic',
        select: 'title slug summary duration order section',
        populate: {
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
        },
      })
      .populate('createdBy', 'name email role');
  }

  /**
   * Delete a resource by ID
   */
  async delete(id) {
    return await Resource.findByIdAndDelete(id);
  }

  /**
   * Count resources matching filter
   */
  async count(filter = {}) {
    return await Resource.countDocuments(filter);
  }
}

export const resourceRepository = new ResourceRepository();
export default resourceRepository;
