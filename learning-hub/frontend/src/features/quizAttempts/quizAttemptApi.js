import api from '../../api/axios';

export const quizAttemptApi = {
  /**
   * Submit an attempt for a quiz
   * POST /api/quizzes/:id/attempts
   */
  createAttempt: async (quizId, data) => {
    const response = await api.post(`/quizzes/${quizId}/attempts`, data);
    return response.data;
  },

  /**
   * Get all attempts and statistics for a specific quiz
   * GET /api/quizzes/:id/attempts
   */
  getQuizAttempts: async (quizId, params = {}) => {
    const response = await api.get(`/quizzes/${quizId}/attempts`, { params });
    return response.data;
  },

  /**
   * Get all attempts by the authenticated user across all quizzes
   * GET /api/quiz-attempts
   */
  getMyAttempts: async (params = {}) => {
    const response = await api.get('/quiz-attempts', { params });
    return response.data;
  },

  /**
   * Get detailed attempt with full question review
   * GET /api/quiz-attempts/:id
   */
  getAttemptById: async (attemptId) => {
    const response = await api.get(`/quiz-attempts/${attemptId}`);
    return response.data;
  },
};
