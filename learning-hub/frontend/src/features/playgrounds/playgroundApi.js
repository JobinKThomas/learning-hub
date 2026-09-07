import api from '../../api/axios';

export const playgroundApi = {
  getAll: async (params = {}) => {
    const response = await api.get('/playgrounds', { params });
    return response.data;
  },

  getByTopic: async (topicId) => {
    const response = await api.get(`/topics/${topicId}/playgrounds`);
    return response.data;
  },

  getBySlug: async (slug) => {
    const response = await api.get(`/playgrounds/${slug}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/playgrounds/id/${id}`);
    return response.data;
  },

  runCode: async ({ code, language = 'javascript', playgroundId = null }) => {
    const url = playgroundId ? `/playgrounds/${playgroundId}/run` : '/playgrounds/run';
    const response = await api.post(url, { code, language, playgroundId });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/playgrounds', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/playgrounds/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/playgrounds/${id}`);
    return response.data;
  },
};
