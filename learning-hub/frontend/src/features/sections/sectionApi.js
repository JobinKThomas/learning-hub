import api from '../../api/axios';

export const sectionApi = {
  /**
   * Fetch all sections with optional query parameters
   * @param {Object} params - { moduleId, search }
   */
  getAll: (params = {}) => api.get('/sections', { params }),

  /**
   * Fetch sections for a specific module (ID or slug)
   * @param {string} moduleId
   */
  getByModule: (moduleId) => api.get(`/modules/${moduleId}/sections`),

  /**
   * Fetch a single section by slug
   * @param {string} slug
   */
  getBySlug: (slug) => api.get(`/sections/${slug}`),

  /**
   * Fetch a single section by MongoDB ID
   * @param {string} id
   */
  getById: (id) => api.get(`/sections/id/${id}`),

  /**
   * Create a new section (Admin only)
   * @param {Object} data
   */
  create: (data) => api.post('/sections', data),

  /**
   * Update an existing section by ID (Admin only)
   * @param {string} id
   * @param {Object} data
   */
  update: (id, data) => api.put(`/sections/${id}`, data),

  /**
   * Delete a section by ID (Admin only)
   * @param {string} id
   */
  delete: (id) => api.delete(`/sections/${id}`),
};

export default sectionApi;
