import api from '../../api/axios';

export const moduleApi = {
  /**
   * Fetch all modules with optional query parameters
   * @param {Object} params - { learningPathId, search }
   */
  getAll: (params = {}) => api.get('/modules', { params }),

  /**
   * Fetch modules for a specific learning path (ID or slug)
   * @param {string} learningPathId
   */
  getByLearningPath: (learningPathId) =>
    api.get(`/learning-paths/${learningPathId}/modules`),

  /**
   * Fetch a single module by slug
   * @param {string} slug
   */
  getBySlug: (slug) => api.get(`/modules/${slug}`),

  /**
   * Fetch a single module by MongoDB ID
   * @param {string} id
   */
  getById: (id) => api.get(`/modules/id/${id}`),

  /**
   * Create a new module (Admin only)
   * @param {Object} data
   */
  create: (data) => api.post('/modules', data),

  /**
   * Update an existing module by ID (Admin only)
   * @param {string} id
   * @param {Object} data
   */
  update: (id, data) => api.put(`/modules/${id}`, data),

  /**
   * Delete a module by ID (Admin only)
   * @param {string} id
   */
  delete: (id) => api.delete(`/modules/${id}`),
};

export default moduleApi;
