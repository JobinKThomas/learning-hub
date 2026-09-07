import api from '../../api/axios';

export const topicApi = {
  /**
   * Fetch all topics with optional query parameters
   * @param {Object} params - { section, sectionId, search }
   */
  getAll: (params = {}) => api.get('/topics', { params }),

  /**
   * Fetch topics for a specific section (ID or slug)
   * @param {string} sectionId
   */
  getBySection: (sectionId) => api.get(`/sections/${sectionId}/topics`),

  /**
   * Fetch a single topic by slug
   * @param {string} slug
   */
  getBySlug: (slug) => api.get(`/topics/${slug}`),

  /**
   * Fetch a single topic by MongoDB ID
   * @param {string} id
   */
  getById: (id) => api.get(`/topics/id/${id}`),

  /**
   * Create a new topic (Admin only)
   * @param {Object} data
   */
  create: (data) => api.post('/topics', data),

  /**
   * Update an existing topic by ID (Admin only)
   * @param {string} id
   * @param {Object} data
   */
  update: (id, data) => api.put(`/topics/${id}`, data),

  /**
   * Delete a topic by ID (Admin only)
   * @param {string} id
   */
  delete: (id) => api.delete(`/topics/${id}`),
};

export default topicApi;
