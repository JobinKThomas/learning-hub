import api from './axios';

/**
 * Authentication API Service
 */
export const authApi = {
  /**
   * Register a new user
   * @param {Object} userData - { name, email, password, role }
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Authenticate user & receive tokens
   * @param {Object} credentials - { email, password }
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Renew access token via refresh token
   * @param {string} refreshToken
   */
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  /**
   * Invalidate session / refresh token
   * @param {string} [refreshToken]
   */
  logout: async (refreshToken) => {
    const response = await api.post('/auth/logout', { refreshToken });
    return response.data;
  },

  /**
   * Fetch current authenticated user profile
   */
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authApi;
