import mongoose from 'mongoose';
import { topicRepository } from '../repositories/topicRepository.js';
import { sectionRepository } from '../repositories/sectionRepository.js';
import { topicPresenter } from '../presenters/topicPresenter.js';
import { ApiError } from '../utils/apiError.js';
import { slugify } from '../models/Topic.js';

export class TopicService {
  constructor(
    repository = topicRepository,
    sectionRepo = sectionRepository,
    presenter = topicPresenter
  ) {
    this.repository = repository;
    this.sectionRepo = sectionRepo;
    this.presenter = presenter;
  }

  /**
   * Helper to resolve parent section by MongoDB ID or slug
   */
  async resolveSection(identifier) {
    if (!identifier) return null;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      const secById = await this.sectionRepo.findById(identifier);
      if (secById) return secById;
    }

    return await this.sectionRepo.findBySlug(identifier);
  }

  /**
   * Retrieve all topics with optional filtering
   */
  async getAllTopics({ sectionId, search, includeUnpublished = false } = {}) {
    const filter = {};

    if (!includeUnpublished) {
      filter.published = { $ne: false };
    }

    if (sectionId) {
      const resolvedSection = await this.resolveSection(sectionId);
      if (resolvedSection) {
        filter.section = resolvedSection._id;
      } else {
        return [];
      }
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { summary: searchRegex },
        { description: searchRegex },
      ];
    }

    const topics = await this.repository.findAll(filter);
    return this.presenter.formatMany(topics);
  }

  /**
   * Retrieve topics for a specific section (by ID or slug)
   */
  async getTopicsBySection(sectionIdentifier, { includeUnpublished = false } = {}) {
    if (!sectionIdentifier) {
      throw new ApiError('Section identifier is required', 400);
    }

    const resolvedSection = await this.resolveSection(sectionIdentifier);
    if (!resolvedSection) {
      throw new ApiError(`Parent section not found: '${sectionIdentifier}'`, 404);
    }

    const filter = {};
    if (!includeUnpublished) {
      filter.published = { $ne: false };
    }

    const topics = await this.repository.findBySectionId(resolvedSection._id, filter);
    return this.presenter.formatMany(topics);
  }

  /**
   * Retrieve a single topic by slug
   */
  async getTopicBySlug(slug) {
    if (!slug) {
      throw new ApiError('Topic slug is required', 400);
    }

    const topic = await this.repository.findBySlug(slug);
    if (!topic) {
      throw new ApiError(`Topic not found with slug: '${slug}'`, 404);
    }

    return this.presenter.format(topic);
  }

  /**
   * Retrieve a single topic by MongoDB ID
   */
  async getTopicById(id) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError('Invalid topic ID format', 400);
    }

    const topic = await this.repository.findById(id);
    if (!topic) {
      throw new ApiError(`Topic not found with ID: '${id}'`, 404);
    }

    return this.presenter.format(topic);
  }

  /**
   * Create a new topic (Admin only)
   */
  async createTopic(data, user = null) {
    const sectionIdentifier = data.section || data.sectionId;
    if (!sectionIdentifier) {
      throw new ApiError('Parent section identifier is required', 400);
    }

    const resolvedSection = await this.resolveSection(sectionIdentifier);
    if (!resolvedSection) {
      throw new ApiError(`Referenced section not found: '${sectionIdentifier}'`, 404);
    }

    // Determine unique slug
    let baseSlug = data.slug ? slugify(data.slug) : slugify(data.title);
    if (!baseSlug) {
      baseSlug = `topic-${Date.now()}`;
    }

    let candidateSlug = baseSlug;
    let counter = 1;
    while (await this.repository.findBySlug(candidateSlug)) {
      candidateSlug = `${baseSlug}-${counter++}`;
    }

    const newTopicData = {
      ...data,
      section: resolvedSection._id,
      slug: candidateSlug,
      createdBy: user?._id || user?.id,
    };

    const created = await this.repository.create(newTopicData);
    return this.presenter.format(created);
  }

  /**
   * Update an existing topic by ID (Admin only)
   */
  async updateTopic(id, data) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError('Invalid topic ID format', 400);
    }

    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new ApiError(`Topic not found with ID: '${id}'`, 404);
    }

    const updateData = { ...data };

    if (updateData.section || updateData.sectionId) {
      const sectionIdentifier = updateData.section || updateData.sectionId;
      const resolvedSection = await this.resolveSection(sectionIdentifier);
      if (!resolvedSection) {
        throw new ApiError(`Referenced section not found: '${sectionIdentifier}'`, 404);
      }
      updateData.section = resolvedSection._id;
      delete updateData.sectionId;
    }

    if (updateData.slug && slugify(updateData.slug) !== existing.slug) {
      const slugCandidate = slugify(updateData.slug);
      const collision = await this.repository.findBySlug(slugCandidate);
      if (collision && collision._id.toString() !== id) {
        throw new ApiError(`Topic slug '${slugCandidate}' is already taken`, 409);
      }
      updateData.slug = slugCandidate;
    }

    const updated = await this.repository.update(id, updateData);
    return this.presenter.format(updated);
  }

  /**
   * Delete a topic by ID (Admin only)
   */
  async deleteTopic(id) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError('Invalid topic ID format', 400);
    }

    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new ApiError(`Topic not found with ID: '${id}'`, 404);
    }

    await this.repository.delete(id);
    return { id, title: existing.title, slug: existing.slug };
  }
}

export const topicService = new TopicService();
export default topicService;
