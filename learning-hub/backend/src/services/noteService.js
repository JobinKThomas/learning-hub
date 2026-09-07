import mongoose from 'mongoose';
import { noteRepository } from '../repositories/noteRepository.js';
import { topicRepository } from '../repositories/topicRepository.js';
import { notePresenter } from '../presenters/notePresenter.js';
import { ApiError } from '../utils/apiError.js';
import { slugify } from '../models/Note.js';

export class NoteService {
  constructor(
    repository = noteRepository,
    topicRepo = topicRepository,
    presenter = notePresenter
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
   * Retrieve all notes with optional filtering (by topic, search query, tag, or publication)
   */
  async getAllNotes({ topicId, search, tag, includeUnpublished = false } = {}) {
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

    if (tag) {
      filter.tags = tag.toLowerCase().trim();
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { summary: searchRegex },
        { content: searchRegex },
      ];
    }

    const notes = await this.repository.findAll(filter);
    return this.presenter.formatMany(notes);
  }

  /**
   * Retrieve notes for a specific topic (by ID or slug)
   */
  async getNotesByTopic(topicIdentifier, { includeUnpublished = false } = {}) {
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

    const notes = await this.repository.findByTopicId(resolvedTopic._id, filter);
    return this.presenter.formatMany(notes);
  }

  /**
   * Retrieve a single note by slug
   */
  async getNoteBySlug(slug) {
    if (!slug) {
      throw new ApiError('Note slug is required', 400);
    }

    const note = await this.repository.findBySlug(slug);
    if (!note) {
      throw new ApiError(`Note not found with slug: '${slug}'`, 404);
    }

    return this.presenter.format(note);
  }

  /**
   * Retrieve a single note by MongoDB ID
   */
  async getNoteById(id) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError('Invalid note ID format', 400);
    }

    const note = await this.repository.findById(id);
    if (!note) {
      throw new ApiError(`Note not found with ID: '${id}'`, 404);
    }

    return this.presenter.format(note);
  }

  /**
   * Create a new note (Admin only)
   */
  async createNote(data, user = null) {
    const topicIdentifier = data.topic || data.topicId;
    if (!topicIdentifier) {
      throw new ApiError('Parent topic identifier is required', 400);
    }

    const resolvedTopic = await this.resolveTopic(topicIdentifier);
    if (!resolvedTopic) {
      throw new ApiError(`Referenced topic not found: '${topicIdentifier}'`, 404);
    }

    // Determine unique slug
    let baseSlug = data.slug ? slugify(data.slug) : slugify(data.title);
    if (!baseSlug) {
      baseSlug = `note-${Date.now()}`;
    }

    let candidateSlug = baseSlug;
    let counter = 1;
    while (await this.repository.findBySlug(candidateSlug)) {
      candidateSlug = `${baseSlug}-${counter++}`;
    }

    // Clean tags array if passed as comma separated string or array
    let tags = [];
    if (Array.isArray(data.tags)) {
      tags = data.tags.map((t) => t.toString().trim().toLowerCase()).filter(Boolean);
    } else if (typeof data.tags === 'string') {
      tags = data.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
    }

    const newNoteData = {
      ...data,
      topic: resolvedTopic._id,
      slug: candidateSlug,
      tags,
      createdBy: user?._id || user?.id,
    };

    const created = await this.repository.create(newNoteData);
    return this.presenter.format(created);
  }

  /**
   * Update an existing note by ID (Admin only)
   */
  async updateNote(id, data) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError('Invalid note ID format', 400);
    }

    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new ApiError(`Note not found with ID: '${id}'`, 404);
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

    if (updateData.slug && slugify(updateData.slug) !== existing.slug) {
      const slugCandidate = slugify(updateData.slug);
      const collision = await this.repository.findBySlug(slugCandidate);
      if (collision && collision._id.toString() !== id) {
        throw new ApiError(`Note slug '${slugCandidate}' is already taken`, 409);
      }
      updateData.slug = slugCandidate;
    }

    if (updateData.tags !== undefined) {
      if (Array.isArray(updateData.tags)) {
        updateData.tags = updateData.tags.map((t) => t.toString().trim().toLowerCase()).filter(Boolean);
      } else if (typeof updateData.tags === 'string') {
        updateData.tags = updateData.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
      }
    }

    const updated = await this.repository.update(id, updateData);
    return this.presenter.format(updated);
  }

  /**
   * Delete a note by ID (Admin only)
   */
  async deleteNote(id) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError('Invalid note ID format', 400);
    }

    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new ApiError(`Note not found with ID: '${id}'`, 404);
    }

    await this.repository.delete(id);
    return { id, title: existing.title, slug: existing.slug };
  }
}

export const noteService = new NoteService();
export default noteService;
