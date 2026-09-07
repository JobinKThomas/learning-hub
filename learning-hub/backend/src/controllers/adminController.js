import { User } from '../models/User.js';
import { getDbStatus } from '../config/db.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class AdminController {
  /**
   * @desc    Get admin platform overview & metrics
   * @route   GET /api/admin/overview
   * @access  Private (Admin only)
   */
  getOverview = async (req, res, next) => {
    try {
      const [totalUsers, totalAdmins, recentUsers] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'ADMIN' }),
        User.find().select('name email role createdAt').sort({ createdAt: -1 }).limit(5),
      ]);

      const standardUsers = totalUsers - totalAdmins;
      const dbStatus = getDbStatus();

      const overviewData = {
        metrics: {
          totalUsers,
          totalAdmins,
          standardUsers,
        },
        system: {
          uptimeSeconds: Math.floor(process.uptime()),
          nodeVersion: process.version,
          databaseStatus: dbStatus.state,
          databaseConnected: dbStatus.state === 'connected',
        },
        recentUsers,
        caller: {
          id: req.user._id,
          name: req.user.name,
          role: req.user.role,
        },
      };

      return sendSuccess(res, 'Admin overview retrieved successfully', overviewData, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Get full list of registered users
   * @route   GET /api/admin/users
   * @access  Private (Admin only)
   */
  getAllUsers = async (req, res, next) => {
    try {
      const users = await User.find()
        .select('name email role createdAt updatedAt')
        .sort({ createdAt: -1 });

      return sendSuccess(res, 'Users retrieved successfully', { users, count: users.length }, 200);
    } catch (error) {
      next(error);
    }
  };
}

export const adminController = new AdminController();
