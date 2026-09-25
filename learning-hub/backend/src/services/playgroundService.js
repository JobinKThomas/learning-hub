import mongoose from 'mongoose';
import { playgroundRepository } from '../repositories/playgroundRepository.js';
import { topicRepository } from '../repositories/topicRepository.js';
import { codeExecutionService } from './codeExecutionService.js';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

async function resolveTopicId(topicIdentifier) {
  if (!topicIdentifier) return null;
  if (mongoose.Types.ObjectId.isValid(topicIdentifier)) {
    const topic = await topicRepository.findById(topicIdentifier);
    if (topic) return topic._id;
  }
  const topicBySlug = await topicRepository.findBySlug(topicIdentifier);
  if (topicBySlug) return topicBySlug._id;
  return null;
}

export const playgroundService = {
  getAllPlaygrounds: async (query = {}, user = null) => {
    const filter = {};
    const isAdmin = user && user.role === 'ADMIN';

    if (!isAdmin) {
      filter.published = true;
    }

    if (query.topic || query.topicId) {
      const topicId = await resolveTopicId(query.topic || query.topicId);
      if (!topicId) {
        return [];
      }
      filter.topic = topicId;
    }

    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
        { instructions: { $regex: query.search, $options: 'i' } },
      ];
    }

    return playgroundRepository.findAll(filter);
  },

  getPlaygroundsByTopic: async (topicIdOrSlug, user = null) => {
    const topicId = await resolveTopicId(topicIdOrSlug);
    if (!topicId) {
      const err = new Error(`Topic '${topicIdOrSlug}' not found`);
      err.statusCode = 404;
      throw err;
    }

    const isAdmin = user && user.role === 'ADMIN';
    return playgroundRepository.findByTopic(topicId, !isAdmin);
  },

  getPlaygroundBySlug: async (slug, user = null) => {
    const playground = await playgroundRepository.findBySlug(slug);
    if (!playground) {
      const err = new Error(`Playground with slug '${slug}' not found`);
      err.statusCode = 404;
      throw err;
    }

    const isAdmin = user && user.role === 'ADMIN';
    if (!playground.published && !isAdmin) {
      const err = new Error(`Playground with slug '${slug}' not found`);
      err.statusCode = 404;
      throw err;
    }

    return playground;
  },

  getPlaygroundById: async (id, user = null) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error(`Invalid playground ID format: '${id}'`);
      err.statusCode = 400;
      throw err;
    }

    const playground = await playgroundRepository.findById(id);
    if (!playground) {
      const err = new Error(`Playground with ID '${id}' not found`);
      err.statusCode = 404;
      throw err;
    }

    const isAdmin = user && user.role === 'ADMIN';
    if (!playground.published && !isAdmin) {
      const err = new Error(`Playground with ID '${id}' not found`);
      err.statusCode = 404;
      throw err;
    }

    return playground;
  },

  /**
   * Controlled code execution
   */
  runCode: async ({ code, language = 'javascript', playgroundId = null }) => {
    const execResult = await codeExecutionService.executeCode({
      code,
      language,
      timeoutMs: 2000,
    });

    // Check challenge expected output if attached to a playground
    let matchesExpectedOutput = null;
    let expectedOutput = null;

    if (playgroundId) {
      try {
        let playground = null;
        if (mongoose.Types.ObjectId.isValid(playgroundId)) {
          playground = await playgroundRepository.findById(playgroundId);
        } else {
          playground = await playgroundRepository.findBySlug(playgroundId);
        }

        if (playground && playground.expectedOutput) {
          expectedOutput = playground.expectedOutput.trim();
          const combinedLogs = execResult.logs.map((l) => l.message).join('\n').trim();
          matchesExpectedOutput =
            combinedLogs === expectedOutput ||
            (execResult.result && execResult.result.trim() === expectedOutput);
        }
      } catch {
        // Continue even if playground reference lookup fails
      }
    }

    return {
      ...execResult,
      matchesExpectedOutput,
      expectedOutput,
    };
  },

  createPlayground: async (data, userId) => {
    const topicId = await resolveTopicId(data.topic || data.topicId);
    if (!topicId) {
      const err = new Error(`Topic '${data.topic || data.topicId}' not found`);
      err.statusCode = 404;
      throw err;
    }

    let slug = data.slug ? slugify(data.slug) : slugify(data.title);
    if (!slug) {
      slug = `playground-${Date.now()}`;
    }

    // Check duplicate slug
    const existing = await playgroundRepository.findBySlug(slug);
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const payload = {
      ...data,
      topic: topicId,
      slug,
      createdBy: userId,
    };

    return playgroundRepository.create(payload);
  },

  updatePlayground: async (id, data) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error(`Invalid playground ID: '${id}'`);
      err.statusCode = 400;
      throw err;
    }

    const existing = await playgroundRepository.findById(id);
    if (!existing) {
      const err = new Error(`Playground with ID '${id}' not found`);
      err.statusCode = 404;
      throw err;
    }

    const updateData = { ...data };

    if (data.topic || data.topicId) {
      const topicId = await resolveTopicId(data.topic || data.topicId);
      if (!topicId) {
        const err = new Error(`Topic '${data.topic || data.topicId}' not found`);
        err.statusCode = 404;
        throw err;
      }
      updateData.topic = topicId;
      delete updateData.topicId;
    }

    if (data.slug && data.slug !== existing.slug) {
      updateData.slug = slugify(data.slug);
      const duplicate = await playgroundRepository.findBySlug(updateData.slug);
      if (duplicate && duplicate._id.toString() !== id) {
        const err = new Error(`Playground with slug '${updateData.slug}' already exists`);
        err.statusCode = 409;
        throw err;
      }
    }

    return playgroundRepository.update(id, updateData);
  },

  deletePlayground: async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error(`Invalid playground ID: '${id}'`);
      err.statusCode = 400;
      throw err;
    }

    const existing = await playgroundRepository.findById(id);
    if (!existing) {
      const err = new Error(`Playground with ID '${id}' not found`);
      err.statusCode = 404;
      throw err;
    }

    await playgroundRepository.delete(id);
    return { id, title: existing.title, slug: existing.slug };
  },
};
