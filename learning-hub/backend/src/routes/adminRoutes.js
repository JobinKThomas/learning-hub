import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

// Protect all admin routes with authentication and admin role requirement
router.use(requireAuth);
router.use(requireAdmin);

/**
 * @openapi
 * /admin/overview:
 *   get:
 *     summary: Get admin platform overview and stats
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overview metrics retrieved successfully
 *       401:
 *         description: Unauthorized (Anonymous)
 *       403:
 *         description: Forbidden (Non-admin User)
 */
router.get('/overview', adminController.getOverview);

/**
 * @openapi
 * /admin/users:
 *   get:
 *     summary: Get all registered platform users
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User list retrieved successfully
 *       401:
 *         description: Unauthorized (Anonymous)
 *       403:
 *         description: Forbidden (Non-admin User)
 */
router.get('/users', adminController.getAllUsers);

export default router;
