import { Note } from '../models/Note.js';

export class NoteRepository {
  /**
   * Helper to build populated query across all 5 tiers
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
   * Find all notes matching filter and sort
   */
  async findAll(filter = {}, sort = { order: 1, createdAt: 1 }) {
    return await this.#buildPopulate(Note.find(filter).sort(sort)).exec();
  }

  /**
   * Find all notes belonging to a specific topic
   */
  async findByTopicId(topicId, filter = {}, sort = { order: 1, createdAt: 1 }) {
    return await this.#buildPopulate(Note.find({ topic: topicId, ...filter }).sort(sort)).exec();
  }

  /**
   * Find a note by its slug
   */
  async findBySlug(slug) {
    return await this.#buildPopulate(Note.findOne({ slug: slug.toLowerCase().trim() })).exec();
  }

  /**
   * Find a note by its MongoDB ID
   */
  async findById(id) {
    return await this.#buildPopulate(Note.findById(id)).exec();
  }

  /**
   * Create a new note
   */
  async create(data) {
    return await Note.create(data);
  }

  /**
   * Update an existing note
   */
  async update(id, data) {
    return await Note.findByIdAndUpdate(id, data, {
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
   * Delete a note by ID
   */
  async delete(id) {
    return await Note.findByIdAndDelete(id);
  }

  /**
   * Count notes matching filter
   */
  async count(filter = {}) {
    return await Note.countDocuments(filter);
  }
}

export const noteRepository = new NoteRepository();
export default noteRepository;
