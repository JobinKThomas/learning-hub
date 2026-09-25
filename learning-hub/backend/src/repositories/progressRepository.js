import { Progress } from '../models/Progress.js';

export const progressRepository = {
  /**
   * Find progress for a specific user and topic
   */
  findByUserAndTopic: async (userId, topicId) => {
    return Progress.findOne({ user: userId, topic: topicId })
      .populate('topic', 'title slug order duration keyPoints')
      .populate('completedNotes', 'title slug order readingTime')
      .populate('completedQuizzes', 'title slug passingScore')
      .populate('completedPlaygrounds', 'title slug language')
      .populate('section', 'title slug order')
      .populate('module', 'title slug order')
      .populate('learningPath', 'title slug level');
  },

  /**
   * Find raw progress record without deep populate for fast checking
   */
  findRawByUserAndTopic: async (userId, topicId) => {
    return Progress.findOne({ user: userId, topic: topicId });
  },

  /**
   * Upsert progress document for a user and topic
   */
  upsertProgress: async (userId, topicId, updateData) => {
    return Progress.findOneAndUpdate(
      { user: userId, topic: topicId },
      {
        $set: updateData,
        $setOnInsert: { user: userId, topic: topicId },
      },
      { new: true, upsert: true, runValidators: true }
    )
      .populate('topic', 'title slug order duration keyPoints')
      .populate('completedNotes', 'title slug order readingTime')
      .populate('completedQuizzes', 'title slug passingScore')
      .populate('completedPlaygrounds', 'title slug language')
      .populate('section', 'title slug order')
      .populate('module', 'title slug order')
      .populate('learningPath', 'title slug level');
  },

  /**
   * Find all progress records for a user across all topics
   */
  findByUser: async (userId) => {
    return Progress.find({ user: userId })
      .populate('topic', 'title slug order keyPoints')
      .populate('section', 'title slug order')
      .populate('module', 'title slug order')
      .populate('learningPath', 'title slug level')
      .sort({ updatedAt: -1 });
  },

  /**
   * Find all progress records for a user within a learning path
   */
  findByUserAndLearningPath: async (userId, learningPathId) => {
    return Progress.find({ user: userId, learningPath: learningPathId })
      .populate('topic', 'title slug order keyPoints')
      .populate('section', 'title slug order')
      .populate('module', 'title slug order')
      .sort({ updatedAt: -1 });
  },

  /**
   * Find all progress records for a user within a module
   */
  findByUserAndModule: async (userId, moduleId) => {
    return Progress.find({ user: userId, module: moduleId })
      .populate('topic', 'title slug order keyPoints')
      .populate('section', 'title slug order')
      .sort({ updatedAt: -1 });
  },

  /**
   * Count completed topics for a user
   */
  countCompletedTopics: async (userId) => {
    return Progress.countDocuments({ user: userId, isCompleted: true });
  },

  /**
   * Get recent progress activities
   */
  getRecentActivity: async (userId, limit = 10) => {
    return Progress.find({ user: userId })
      .sort({ lastAccessedAt: -1, updatedAt: -1 })
      .limit(limit)
      .populate('topic', 'title slug order')
      .populate('module', 'title slug')
      .populate('learningPath', 'title slug');
  },
};

export default progressRepository;
