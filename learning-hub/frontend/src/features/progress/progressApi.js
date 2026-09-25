import api from '../../api/axios';

export const progressApi = {
  /**
   * Update progress for a topic / note / quiz / playground / key point
   * @param {Object} data - { topicId, noteId, quizId, playgroundId, keyPointIndex, completed, isCompleted }
   */
  updateProgress: (data) => api.post('/progress', data),

  /**
   * Get overarching learning progress across all paths
   */
  getOverallProgress: () => api.get('/progress'),

  /**
   * Get progress for a specific topic (by ID or slug)
   * @param {string} topicId
   */
  getTopicProgress: (topicId) => api.get(`/progress/topic/${topicId}`),

  /**
   * Get hierarchical progress for a learning path (by ID or slug)
   * @param {string} id
   */
  getLearningPathProgress: (id) => api.get(`/progress/learning-path/${id}`),

  /**
   * Get progress for a specific module (by ID or slug)
   * @param {string} id
   */
  getModuleProgress: (id) => api.get(`/progress/module/${id}`),
};

export default progressApi;
