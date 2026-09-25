import api from '../../api/axios';

export const resourceApi = {
  /**
   * Fetch all resources with optional query parameters
   * @param {Object} params - { topic, topicId, type, search }
   */
  getAll: (params = {}) => api.get('/resources', { params }),

  /**
   * Fetch resources for a specific topic (ID or slug)
   * @param {string} topicId
   * @param {Object} params - { type }
   */
  getByTopic: (topicId, params = {}) =>
    api.get(`/topics/${topicId}/resources`, { params }),

  /**
   * Fetch a single resource by MongoDB ID
   * @param {string} id
   */
  getById: (id) => api.get(`/resources/${id}`),

  /**
   * Create a new resource (Admin only)
   * @param {Object} data
   */
  create: (data) => api.post('/resources', data),

  /**
   * Update an existing resource by ID (Admin only)
   * @param {string} id
   * @param {Object} data
   */
  update: (id, data) => api.put(`/resources/${id}`, data),

  /**
   * Delete a resource by ID (Admin only)
   * @param {string} id
   */
  delete: (id) => api.delete(`/resources/${id}`),
};

export default resourceApi;
