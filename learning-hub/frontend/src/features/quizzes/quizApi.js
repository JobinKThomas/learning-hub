import api from '../../api/axios';

export const quizApi = {
  getAll: async (params = {}) => {
    const response = await api.get('/quizzes', { params });
    return response.data;
  },

  getByTopic: async (topicId) => {
    const response = await api.get(`/topics/${topicId}/quizzes`);
    return response.data;
  },

  getById: async (id, params = {}) => {
    const response = await api.get(`/quizzes/${id}`, { params });
    return response.data;
  },

  submit: async (id, answers) => {
    const response = await api.post(`/quizzes/${id}/submit`, { answers });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/quizzes', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/quizzes/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/quizzes/${id}`);
    return response.data;
  },
};
