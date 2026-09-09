import { learningPathRepository } from '../repositories/learningPathRepository.js';
import { learningPathPresenter } from '../presenters/learningPathPresenter.js';
import { Module } from '../models/Module.js';
import { Section } from '../models/Section.js';
import { Topic } from '../models/Topic.js';
import { ApiError } from '../utils/apiError.js';
import { slugify } from '../models/LearningPath.js';

export class LearningPathService {
  constructor(repository = learningPathRepository, presenter = learningPathPresenter) {
    this.repository = repository;
    this.presenter = presenter;
  }

  /**
   * Retrieve learning paths with search, filter, sort, and pagination
   */
  async getAllPaths({
    category,
    level,
    difficulty,
    status,
    published,
    search,
    sort = 'createdAt',
    order = 'desc',
    page = 1,
    limit = 10,
    includeUnpublished = false,
  } = {}) {
    const filter = {};

    // 1. Status / Published Filter
    if (!includeUnpublished) {
      filter.published = { $ne: false };
    } else {
      if (status) {
        const s = status.toLowerCase().trim();
        if (s === 'published') {
          filter.published = true;
        } else if (s === 'draft' || s === 'unpublished') {
          filter.published = false;
        }
      } else if (published !== undefined) {
        filter.published = String(published) === 'true';
      }
    }

    // 2. Category Filter
    if (category && category !== 'All') {
      filter.category = new RegExp(`^${category.trim()}$`, 'i');
    }

    // 3. Difficulty / Level Filter
    const targetLevel = level || difficulty;
    if (targetLevel && targetLevel !== 'All') {
      filter.level = new RegExp(`^${targetLevel.trim()}$`, 'i');
    }

    // 4. Search Filter
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { tags: searchRegex },
      ];
    }

    // 5. Sorting
    let sortField = sort;
    let sortDir = order === 'asc' || order === '1' || order === 1 ? 1 : -1;
    if (typeof sort === 'string') {
      if (sort.startsWith('-')) {
        sortField = sort.substring(1);
        sortDir = -1;
      } else if (sort.startsWith('+')) {
        sortField = sort.substring(1);
        sortDir = 1;
      }
    }

    const allowedSortFields = ['createdAt', 'title', 'level', 'order', 'category', 'updatedAt'];
    if (!allowedSortFields.includes(sortField)) {
      sortField = 'createdAt';
    }
    const sortObj = { [sortField]: sortDir };

    // 6. Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);

    const { paths, pagination } = await this.repository.findPaginated(
      filter,
      sortObj,
      pageNum,
      limitNum
    );

    await this.populateModulesAndTopics(paths, includeUnpublished);

    return {
      paths: this.presenter.formatMany(paths),
      pagination,
    };
  }

  /**
   * Helper to populate modules and topics from 5-tier collections
   */
  async populateModulesAndTopics(paths, includeUnpublished = false) {
    if (!paths) return;
    const isSingle = !Array.isArray(paths);
    const pathList = isSingle ? [paths] : paths;
    if (pathList.length === 0) return;

    const pathIds = pathList.map((p) => p._id || p.id).filter(Boolean);
    if (pathIds.length === 0) return;

    const moduleFilter = {
      learningPath: { $in: pathIds },
    };
    if (!includeUnpublished) {
      moduleFilter.published = { $ne: false };
    }

    const modules = await Module.find(moduleFilter)
      .sort({ order: 1, createdAt: 1 })
      .lean();

    const moduleIds = modules.map((m) => m._id);

    const sectionFilter = {
      module: { $in: moduleIds },
    };
    if (!includeUnpublished) {
      sectionFilter.published = { $ne: false };
    }

    const sections = await Section.find(sectionFilter)
      .sort({ order: 1, createdAt: 1 })
      .lean();

    const sectionIds = sections.map((s) => s._id);

    const topicFilter = {
      section: { $in: sectionIds },
    };
    if (!includeUnpublished) {
      topicFilter.published = { $ne: false };
    }

    const topics = await Topic.find(topicFilter)
      .sort({ order: 1, createdAt: 1 })
      .lean();

    // Map topics to sections
    const topicsBySectionId = {};
    for (const t of topics) {
      const sId = t.section.toString();
      if (!topicsBySectionId[sId]) topicsBySectionId[sId] = [];
      topicsBySectionId[sId].push(t);
    }

    // Map sections to modules
    const sectionsByModuleId = {};
    for (const s of sections) {
      const mId = s.module.toString();
      if (!sectionsByModuleId[mId]) sectionsByModuleId[mId] = [];
      sectionsByModuleId[mId].push({
        ...s,
        topics: topicsBySectionId[s._id.toString()] || [],
      });
    }

    // Map modules to learning paths
    const modulesByPathId = {};
    for (const m of modules) {
      const pId = m.learningPath.toString();
      const modSections = sectionsByModuleId[m._id.toString()] || [];
      const dbTopics = modSections.flatMap((s) => s.topics || []);

      const topicTitles =
        dbTopics.length > 0
          ? dbTopics.map((t) => t.title)
          : Array.isArray(m.topics)
          ? m.topics
          : [];

      const topicsCount = Math.max(dbTopics.length, (m.topics || []).length);

      const formattedModule = {
        _id: m._id,
        id: m._id.toString(),
        title: m.title,
        slug: m.slug,
        description: m.description || '',
        duration: m.duration || '2 hours',
        order: m.order ?? 1,
        topicsCount,
        topics: topicTitles,
        topicDetails: dbTopics.map((t) => ({
          id: t._id.toString(),
          title: t.title,
          slug: t.slug,
          duration: t.duration || '15 mins',
          order: t.order ?? 1,
        })),
        sections: modSections.map((s) => ({
          id: s._id.toString(),
          title: s.title,
          slug: s.slug,
          topicsCount: (s.topics || []).length,
        })),
      };

      if (!modulesByPathId[pId]) modulesByPathId[pId] = [];
      modulesByPathId[pId].push(formattedModule);
    }

    // Attach to paths
    for (const path of pathList) {
      const pId = (path._id || path.id).toString();
      const standaloneModules = modulesByPathId[pId];

      if (standaloneModules && standaloneModules.length > 0) {
        const totalTopics = standaloneModules.reduce(
          (acc, m) => acc + (m.topicsCount || (m.topics ? m.topics.length : 0)),
          0
        );

        path.modules = standaloneModules;
        path.modulesCount = standaloneModules.length;
        path.totalTopics = totalTopics;
      } else if (Array.isArray(path.modules) && path.modules.length > 0) {
        // Fallback to embedded modules if any
        const totalTopics = path.modules.reduce(
          (acc, m) => acc + (m.topics ? m.topics.length : 0),
          0
        );
        path.modulesCount = path.modules.length;
        path.totalTopics = totalTopics;
      } else {
        path.modules = [];
        path.modulesCount = 0;
        path.totalTopics = 0;
      }
    }
  }

  /**
   * Retrieve a single learning path by its slug
   */
  async getPathBySlug(slug) {
    if (!slug) {
      throw new ApiError('Slug parameter is required', 400);
    }

    const path = await this.repository.findBySlug(slug);
    if (!path) {
      throw new ApiError(`Learning path not found with slug: '${slug}'`, 404);
    }

    await this.populateModulesAndTopics(path, true);

    return this.presenter.format(path);
  }

  /**
   * Retrieve a single learning path by its ID
   */
  async getPathById(id) {
    if (!id) {
      throw new ApiError('ID parameter is required', 400);
    }

    const path = await this.repository.findById(id);
    if (!path) {
      throw new ApiError(`Learning path not found with ID: '${id}'`, 404);
    }

    await this.populateModulesAndTopics(path, true);

    return this.presenter.format(path);
  }

  /**
   * Create a new learning path
   */
  async createPath(data, userId) {
    const targetSlug = data.slug ? slugify(data.slug) : slugify(data.title);

    const existing = await this.repository.findBySlug(targetSlug);
    if (existing) {
      throw new ApiError(`A learning path with slug '${targetSlug}' already exists`, 409);
    }

    const pathData = {
      ...data,
      slug: targetSlug,
      createdBy: userId,
    };

    const newPath = await this.repository.create(pathData);
    return this.presenter.format(newPath);
  }

  /**
   * Update an existing learning path by ID
   */
  async updatePath(id, data) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new ApiError(`Learning path not found with ID: '${id}'`, 404);
    }

    if (data.slug) {
      const newSlug = slugify(data.slug);
      if (newSlug !== existing.slug) {
        const slugOwner = await this.repository.findBySlug(newSlug);
        if (slugOwner && slugOwner._id.toString() !== id) {
          throw new ApiError(`A learning path with slug '${newSlug}' already exists`, 409);
        }
        data.slug = newSlug;
      }
    } else if (data.title && data.title !== existing.title && !data.slug) {
      const generatedSlug = slugify(data.title);
      const slugOwner = await this.repository.findBySlug(generatedSlug);
      if (slugOwner && slugOwner._id.toString() !== id) {
        throw new ApiError(`A learning path with slug '${generatedSlug}' already exists`, 409);
      }
      data.slug = generatedSlug;
    }

    const updated = await this.repository.update(id, data);
    return this.presenter.format(updated);
  }

  /**
   * Delete a learning path by ID
   */
  async deletePath(id) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new ApiError(`Learning path not found with ID: '${id}'`, 404);
    }

    await this.repository.delete(id);
    return { message: 'Learning path deleted successfully', id };
  }
}

export const learningPathService = new LearningPathService();
