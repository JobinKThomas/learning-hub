import api from '../../api/axios';

export const dashboardApi = {
  /**
   * Fetch aggregated dashboard metrics, continue learning, and curriculum status
   */
  getDashboardData: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },
};

export default dashboardApi;
