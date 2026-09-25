import mongoose from 'mongoose';
import { interviewQuestionRepository } from '../repositories/interviewQuestionRepository.js';
import { topicRepository } from '../repositories/topicRepository.js';

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

export const interviewQuestionService = {
  getAllQuestions: async (query = {}, user = null) => {
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

    if (query.difficulty) {
      filter.difficulty = query.difficulty.toUpperCase();
    }

    if (query.search) {
      filter.$or = [
        { question: { $regex: query.search, $options: 'i' } },
        { answer: { $regex: query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(query.search, 'i')] } },
      ];
    }

    return interviewQuestionRepository.findAll(filter);
  },

  getQuestionsByTopic: async (topicIdOrSlug, user = null) => {
    const topicId = await resolveTopicId(topicIdOrSlug);
    if (!topicId) {
      const err = new Error(`Topic '${topicIdOrSlug}' not found`);
      err.statusCode = 404;
      throw err;
    }

    const isAdmin = user && user.role === 'ADMIN';
    return interviewQuestionRepository.findByTopic(topicId, !isAdmin);
  },

  getQuestionById: async (id, user = null) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error(`Invalid interview question ID: '${id}'`);
      err.statusCode = 400;
      throw err;
    }

    const question = await interviewQuestionRepository.findById(id);
    if (!question) {
      const err = new Error(`Interview question '${id}' not found`);
      err.statusCode = 404;
      throw err;
    }

    const isAdmin = user && user.role === 'ADMIN';
    if (!question.published && !isAdmin) {
      const err = new Error(`Interview question '${id}' not found`);
      err.statusCode = 404;
      throw err;
    }

    return question;
  },

  createQuestion: async (data, userId) => {
    const topicId = await resolveTopicId(data.topic || data.topicId);
    if (!topicId) {
      const err = new Error(`Topic '${data.topic || data.topicId}' not found`);
      err.statusCode = 404;
      throw err;
    }

    const payload = {
      ...data,
      topic: topicId,
      createdBy: userId,
    };

    return interviewQuestionRepository.create(payload);
  },

  updateQuestion: async (id, data) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error(`Invalid interview question ID: '${id}'`);
      err.statusCode = 400;
      throw err;
    }

    const existing = await interviewQuestionRepository.findById(id);
    if (!existing) {
      const err = new Error(`Interview question '${id}' not found`);
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

    return interviewQuestionRepository.update(id, updateData);
  },

  deleteQuestion: async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error(`Invalid interview question ID: '${id}'`);
      err.statusCode = 400;
      throw err;
    }

    const existing = await interviewQuestionRepository.findById(id);
    if (!existing) {
      const err = new Error(`Interview question '${id}' not found`);
      err.statusCode = 404;
      throw err;
    }

    await interviewQuestionRepository.delete(id);
    return { id, question: existing.question };
  },
};
