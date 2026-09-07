import api from '../../api/axios';

export const interviewQuestionApi = {
  /**
   * Fetch all interview questions with optional query parameters
   * @param {Object} params - { topic, topicId, difficulty, search, published }
   */
  getAll: (params = {}) => api.get('/interview-questions', { params }),

  /**
   * Fetch interview questions for a specific topic (ID or slug)
   * @param {string} topicId
   * @param {Object} params - { difficulty, search }
   */
  getByTopic: (topicId, params = {}) =>
    api.get(`/topics/${topicId}/interview-questions`, { params }),

  /**
   * Fetch a single interview question by MongoDB ID
   * @param {string} id
   */
  getById: (id) => api.get(`/interview-questions/${id}`),

  /**
   * Create a new interview question (Admin only)
   * @param {Object} data
   */
  create: (data) => api.post('/interview-questions', data),

  /**
   * Update an existing interview question by ID (Admin only)
   * @param {string} id
   * @param {Object} data
   */
  update: (id, data) => api.put(`/interview-questions/${id}`, data),

  /**
   * Delete an interview question by ID (Admin only)
   * @param {string} id
   */
  delete: (id) => api.delete(`/interview-questions/${id}`),
};

export default interviewQuestionApi;
