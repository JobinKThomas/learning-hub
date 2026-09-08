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

  /**
   * Update authenticated user profile name
   * @param {Object} data - { name }
   */
  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  /**
   * Update authenticated user password
   * @param {Object} data - { currentPassword, newPassword }
   */
  updatePassword: async (data) => {
    const response = await api.put('/auth/update-password', data);
    return response.data;
  },

  /**
   * Request password reset link
   * @param {string} email
   */
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Reset password with token
   * @param {string} token
   * @param {string} password
   */
  resetPassword: async (token, password) => {
    const response = await api.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  },
};

export default authApi;
