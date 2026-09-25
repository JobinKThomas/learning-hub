import api from '../../api/axios';

export const noteApi = {
  /**
   * Fetch all notes with optional query parameters
   * @param {Object} params - { topic, topicId, search, tag }
   */
  getAll: (params = {}) => api.get('/notes', { params }),

  /**
   * Fetch notes for a specific topic (ID or slug)
   * @param {string} topicId
   */
  getByTopic: (topicId) => api.get(`/topics/${topicId}/notes`),

  /**
   * Fetch a single note by slug
   * @param {string} slug
   */
  getBySlug: (slug) => api.get(`/notes/${slug}`),

  /**
   * Fetch a single note by MongoDB ID
   * @param {string} id
   */
  getById: (id) => api.get(`/notes/id/${id}`),

  /**
   * Create a new note (Admin only)
   * @param {Object} data
   */
  create: (data) => api.post('/notes', data),

  /**
   * Update an existing note by ID (Admin only)
   * @param {string} id
   * @param {Object} data
   */
  update: (id, data) => api.put(`/notes/${id}`, data),

  /**
   * Delete a note by ID (Admin only)
   * @param {string} id
   */
  delete: (id) => api.delete(`/notes/${id}`),
};

export default noteApi;
