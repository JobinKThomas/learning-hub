import { dashboardService } from '../services/dashboardService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class DashboardController {
  constructor(service = dashboardService) {
    this.service = service;
  }

  /**
   * @desc    Get user learning dashboard metrics, continue learning, and curriculum overview
   * @route   GET /api/dashboard
   * @access  Private (Authenticated users)
   */
  getDashboard = async (req, res, next) => {
    try {
      const userId = req.user._id || req.user.id;
      const dashboardData = await this.service.getDashboardData(userId, req.user);

      return sendSuccess(res, 'Dashboard data retrieved successfully', dashboardData, 200);
    } catch (error) {
      next(error);
    }
  };
}

export const dashboardController = new DashboardController();
export default dashboardController;
