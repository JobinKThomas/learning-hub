import api from '../../api/axios';

export const learningPathApi = {
  /**
   * Fetch all learning paths with optional filters
   * @param {Object} params - { category, level, search }
   */
  getAll: (params = {}) => api.get('/learning-paths', { params }),

  /**
   * Fetch a single learning path by slug
   * @param {string} slug
   */
  getBySlug: (slug) => api.get(`/learning-paths/${slug}`),

  /**
   * Fetch a single learning path by its MongoDB ID
   * @param {string} id
   */
  getById: (id) => api.get(`/learning-paths/id/${id}`),

  /**
   * Create a new learning path (Admin only)
   * @param {Object} data
   */
  create: (data) => api.post('/learning-paths', data),

  /**
   * Update an existing learning path by ID (Admin only)
   * @param {string} id
   * @param {Object} data
   */
  update: (id, data) => api.put(`/learning-paths/${id}`, data),

  /**
   * Delete a learning path by ID (Admin only)
   * @param {string} id
   */
  delete: (id) => api.delete(`/learning-paths/${id}`),
};

export default learningPathApi;
