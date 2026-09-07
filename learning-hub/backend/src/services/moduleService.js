import mongoose from 'mongoose';
import { moduleRepository } from '../repositories/moduleRepository.js';
import { learningPathRepository } from '../repositories/learningPathRepository.js';
import { modulePresenter } from '../presenters/modulePresenter.js';
import { ApiError } from '../utils/apiError.js';
import { slugify } from '../models/Module.js';

export class ModuleService {
  constructor(
    repository = moduleRepository,
    pathRepo = learningPathRepository,
    presenter = modulePresenter
  ) {
    this.repository = repository;
    this.pathRepo = pathRepo;
    this.presenter = presenter;
  }

  /**
   * Helper to resolve a learning path by MongoDB ID or by slug
   */
  async resolveLearningPath(identifier) {
    if (!identifier) return null;

    // Check if valid ObjectId
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      const pathById = await this.pathRepo.findById(identifier);
      if (pathById) return pathById;
    }

    // Otherwise lookup by slug
    return await this.pathRepo.findBySlug(identifier);
  }

  /**
   * Retrieve all modules with optional filtering
   */
  async getAllModules({ learningPathId, search, includeUnpublished = false } = {}) {
    const filter = {};

    if (!includeUnpublished) {
      filter.published = { $ne: false };
    }

    if (learningPathId) {
      const resolvedPath = await this.resolveLearningPath(learningPathId);
      if (resolvedPath) {
        filter.learningPath = resolvedPath._id;
      } else {
        // If an invalid learning path identifier was specified, return empty
        return [];
      }
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    const modules = await this.repository.findAll(filter);
    return this.presenter.formatMany(modules);
  }

  /**
   * Retrieve all modules for a specific learning path (by ID or by slug)
   */
  async getModulesByLearningPath(pathIdentifier, { includeUnpublished = false } = {}) {
    if (!pathIdentifier) {
      throw new ApiError('Learning path identifier is required', 400);
    }

    const resolvedPath = await this.resolveLearningPath(pathIdentifier);
    if (!resolvedPath) {
      throw new ApiError(`Learning path not found: '${pathIdentifier}'`, 404);
    }

    const filter = {};
    if (!includeUnpublished) {
      filter.published = { $ne: false };
    }

    const modules = await this.repository.findByLearningPathId(resolvedPath._id, filter);
    return this.presenter.formatMany(modules);
  }

  /**
   * Retrieve a single module by slug
   */
  async getModuleBySlug(slug) {
    if (!slug) {
      throw new ApiError('Module slug is required', 400);
    }

    const mod = await this.repository.findBySlug(slug);
    if (!mod) {
      throw new ApiError(`Module not found with slug: '${slug}'`, 404);
    }

    return this.presenter.format(mod);
  }

  /**
   * Retrieve a single module by MongoDB ID
   */
  async getModuleById(id) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError('Invalid module ID format', 400);
    }

    const mod = await this.repository.findById(id);
    if (!mod) {
      throw new ApiError(`Module not found with ID: '${id}'`, 404);
    }

    return this.presenter.format(mod);
  }

  /**
   * Create a new module (Admin only)
   */
  async createModule(data, user = null) {
    const pathIdentifier = data.learningPath || data.learningPathId;
    if (!pathIdentifier) {
      throw new ApiError('Parent learning path is required', 400);
    }

    const resolvedPath = await this.resolveLearningPath(pathIdentifier);
    if (!resolvedPath) {
      throw new ApiError(`Referenced learning path not found: '${pathIdentifier}'`, 404);
    }

    // Determine unique slug
    let baseSlug = data.slug ? slugify(data.slug) : slugify(data.title);
    if (!baseSlug) {
      baseSlug = `module-${Date.now()}`;
    }

    let candidateSlug = baseSlug;
    let counter = 1;
    while (await this.repository.findBySlug(candidateSlug)) {
      candidateSlug = `${baseSlug}-${counter++}`;
    }

    const newModuleData = {
      ...data,
      learningPath: resolvedPath._id,
      slug: candidateSlug,
      createdBy: user?._id || user?.id,
    };

    const created = await this.repository.create(newModuleData);
    return this.presenter.format(created);
  }

  /**
   * Update an existing module by ID (Admin only)
   */
  async updateModule(id, data) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError('Invalid module ID format', 400);
    }

    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new ApiError(`Module not found with ID: '${id}'`, 404);
    }

    const updateData = { ...data };

    // If updating learning path, verify it exists
    if (updateData.learningPath || updateData.learningPathId) {
      const pathIdentifier = updateData.learningPath || updateData.learningPathId;
      const resolvedPath = await this.resolveLearningPath(pathIdentifier);
      if (!resolvedPath) {
        throw new ApiError(`Referenced learning path not found: '${pathIdentifier}'`, 404);
      }
      updateData.learningPath = resolvedPath._id;
      delete updateData.learningPathId;
    }

    // If updating slug, verify uniqueness
    if (updateData.slug && slugify(updateData.slug) !== existing.slug) {
      const slugCandidate = slugify(updateData.slug);
      const collision = await this.repository.findBySlug(slugCandidate);
      if (collision && collision._id.toString() !== id) {
        throw new ApiError(`Module slug '${slugCandidate}' is already taken`, 409);
      }
      updateData.slug = slugCandidate;
    }

    const updated = await this.repository.update(id, updateData);
    return this.presenter.format(updated);
  }

  /**
   * Delete a module by ID (Admin only)
   */
  async deleteModule(id) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError('Invalid module ID format', 400);
    }

    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new ApiError(`Module not found with ID: '${id}'`, 404);
    }

    await this.repository.delete(id);
    return { id, title: existing.title, slug: existing.slug };
  }
}

export const moduleService = new ModuleService();
export default moduleService;
