import { InterviewQuestion } from '../models/InterviewQuestion.js';

export const interviewQuestionRepository = {
  create: async (data) => {
    const question = new InterviewQuestion(data);
    return question.save();
  },

  findById: async (id) => {
    return InterviewQuestion.findById(id)
      .populate({
        path: 'topic',
        select: 'title slug section',
        populate: {
          path: 'section',
          select: 'title slug module',
          populate: {
            path: 'module',
            select: 'title slug learningPath',
            populate: {
              path: 'learningPath',
              select: 'title slug',
            },
          },
        },
      })
      .populate('createdBy', 'name email role');
  },

  findByTopic: async (topicId, publishedOnly = false) => {
    const filter = { topic: topicId };
    if (publishedOnly) {
      filter.published = true;
    }

    return InterviewQuestion.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .populate({
        path: 'topic',
        select: 'title slug section',
        populate: {
          path: 'section',
          select: 'title slug module',
          populate: {
            path: 'module',
            select: 'title slug learningPath',
            populate: {
              path: 'learningPath',
              select: 'title slug',
            },
          },
        },
      })
      .populate('createdBy', 'name email');
  },

  findAll: async (filter = {}, options = {}) => {
    const { limit = 50, skip = 0, sort = { order: 1, createdAt: -1 } } = options;

    return InterviewQuestion.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'topic',
        select: 'title slug section',
        populate: {
          path: 'section',
          select: 'title slug module',
          populate: {
            path: 'module',
            select: 'title slug learningPath',
            populate: {
              path: 'learningPath',
              select: 'title slug',
            },
          },
        },
      })
      .populate('createdBy', 'name email');
  },

  update: async (id, data) => {
    return InterviewQuestion.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
      .populate({
        path: 'topic',
        select: 'title slug section',
        populate: {
          path: 'section',
          select: 'title slug module',
          populate: {
            path: 'module',
            select: 'title slug learningPath',
            populate: {
              path: 'learningPath',
              select: 'title slug',
            },
          },
        },
      })
      .populate('createdBy', 'name email');
  },

  delete: async (id) => {
    return InterviewQuestion.findByIdAndDelete(id);
  },

  count: async (filter = {}) => {
    return InterviewQuestion.countDocuments(filter);
  },
};
