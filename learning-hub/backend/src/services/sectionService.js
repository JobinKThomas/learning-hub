import mongoose from 'mongoose';
import { sectionRepository } from '../repositories/sectionRepository.js';
import { moduleRepository } from '../repositories/moduleRepository.js';
import { sectionPresenter } from '../presenters/sectionPresenter.js';
import { ApiError } from '../utils/apiError.js';
import { slugify } from '../models/Section.js';
import { Topic } from '../models/Topic.js';
import { calculateSectionDuration } from '../utils/durationCalculator.js';
import { syncHierarchyDurations } from './hierarchyDurationService.js';

export class SectionService {
  constructor(
    repository = sectionRepository,
    moduleRepo = moduleRepository,
    presenter = sectionPresenter
  ) {
    this.repository = repository;
    this.moduleRepo = moduleRepo;
    this.presenter = presenter;
  }

  /**
   * Helper to resolve parent module by MongoDB ID or slug
   */
  async resolveModule(identifier) {
    if (!identifier) return null;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      const modById = await this.moduleRepo.findById(identifier);
      if (modById) return modById;
    }

    return await this.moduleRepo.findBySlug(identifier);
  }

  /**
   * Retrieve all sections with optional filtering
   */
  async getAllSections({ moduleId, search, includeUnpublished = false } = {}) {
    const filter = {};

    if (!includeUnpublished) {
      filter.published = { $ne: false };
    }

    if (moduleId) {
      const resolvedModule = await this.resolveModule(moduleId);
      if (resolvedModule) {
        filter.module = resolvedModule._id;
      } else {
        return [];
      }
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    const sections = await this.repository.findAll(filter);
    return this.presenter.formatMany(sections);
  }

  /**
   * Retrieve sections for a specific module (by ID or slug)
   */
  async getSectionsByModule(moduleIdentifier, { includeUnpublished = false } = {}) {
    if (!moduleIdentifier) {
      throw new ApiError('Module identifier is required', 400);
    }

    const resolvedModule = await this.resolveModule(moduleIdentifier);
    if (!resolvedModule) {
      throw new ApiError(`Parent module not found: '${moduleIdentifier}'`, 404);
    }

    const filter = {};
    if (!includeUnpublished) {
      filter.published = { $ne: false };
    }

    const sections = await this.repository.findByModuleId(resolvedModule._id, filter);
    return this.presenter.formatMany(sections);
  }

  /**
   * Retrieve a single section by slug
   */
  async getSectionBySlug(slug) {
    if (!slug) {
      throw new ApiError('Section slug is required', 400);
    }

    const section = await this.repository.findBySlug(slug);
    if (!section) {
      throw new ApiError(`Section not found with slug: '${slug}'`, 404);
    }

    return this.presenter.format(section);
  }

  /**
   * Retrieve a single section by MongoDB ID
   */
  async getSectionById(id) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError('Invalid section ID format', 400);
    }

    const section = await this.repository.findById(id);
    if (!section) {
      throw new ApiError(`Section not found with ID: '${id}'`, 404);
    }

    return this.presenter.format(section);
  }

  /**
   * Create a new section (Admin only)
   */
  async createSection(data, user = null) {
    const moduleIdentifier = data.module || data.moduleId;
    if (!moduleIdentifier) {
      throw new ApiError('Parent module identifier is required', 400);
    }

    const resolvedModule = await this.resolveModule(moduleIdentifier);
    if (!resolvedModule) {
      throw new ApiError(`Referenced module not found: '${moduleIdentifier}'`, 404);
    }

    // Determine unique slug
    let baseSlug = data.slug ? slugify(data.slug) : slugify(data.title);
    if (!baseSlug) {
      baseSlug = `section-${Date.now()}`;
    }

    let candidateSlug = baseSlug;
    let counter = 1;
    while (await this.repository.findBySlug(candidateSlug)) {
      candidateSlug = `${baseSlug}-${counter++}`;
    }

    // Calculate duration if not provided or auto requested
    let sectionDuration = data.duration;
    if (!sectionDuration || (typeof sectionDuration === 'string' && sectionDuration.trim() === '') || data.autoCalculateDuration) {
      sectionDuration = calculateSectionDuration([], data).formatted;
    }

    const newSectionData = {
      ...data,
      module: resolvedModule._id,
      slug: candidateSlug,
      duration: sectionDuration,
      createdBy: user?._id || user?.id,
    };

    const created = await this.repository.create(newSectionData);

    // Sync parent module and learning path durations
    await syncHierarchyDurations({ moduleId: resolvedModule._id });

    return this.presenter.format(created);
  }

  /**
   * Update an existing section by ID (Admin only)
   */
  async updateSection(id, data) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError('Invalid section ID format', 400);
    }

    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new ApiError(`Section not found with ID: '${id}'`, 404);
    }

    const updateData = { ...data };

    if (updateData.module || updateData.moduleId) {
      const moduleIdentifier = updateData.module || updateData.moduleId;
      const resolvedModule = await this.resolveModule(moduleIdentifier);
      if (!resolvedModule) {
        throw new ApiError(`Referenced module not found: '${moduleIdentifier}'`, 404);
      }
      updateData.module = resolvedModule._id;
      delete updateData.moduleId;
    }

    if (updateData.slug && slugify(updateData.slug) !== existing.slug) {
      const slugCandidate = slugify(updateData.slug);
      const collision = await this.repository.findBySlug(slugCandidate);
      if (collision && collision._id.toString() !== id) {
        throw new ApiError(`Section slug '${slugCandidate}' is already taken`, 409);
      }
      updateData.slug = slugCandidate;
    }

    // If duration is cleared or auto-calculation requested
    if (updateData.duration === '' || updateData.autoCalculateDuration) {
      const topics = await Topic.find({ section: id });
      const merged = { ...existing.toObject(), ...updateData };
      updateData.duration = calculateSectionDuration(topics, merged).formatted;
    }

    const updated = await this.repository.update(id, updateData);

    // Sync parent module and learning path durations
    const currentModuleId = updateData.module || existing.module;
    await syncHierarchyDurations({ sectionId: id, moduleId: currentModuleId });
    if (updateData.module && updateData.module.toString() !== existing.module.toString()) {
      await syncHierarchyDurations({ moduleId: existing.module });
    }

    return this.presenter.format(updated);
  }

  /**
   * Delete a section by ID (Admin only)
   */
  async deleteSection(id) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError('Invalid section ID format', 400);
    }

    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new ApiError(`Section not found with ID: '${id}'`, 404);
    }

    await this.repository.delete(id);

    // Sync parent module and learning path durations
    await syncHierarchyDurations({ moduleId: existing.module });

    return { id, title: existing.title, slug: existing.slug };
  }
}

export const sectionService = new SectionService();
export default sectionService;
