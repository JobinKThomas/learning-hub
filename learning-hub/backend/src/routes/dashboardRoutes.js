import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();

// GET /api/dashboard - Protected user dashboard metrics
router.get('/', requireAuth, dashboardController.getDashboard);

export default router;
