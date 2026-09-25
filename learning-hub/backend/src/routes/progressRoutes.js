import { Router } from 'express';
import { progressController } from '../controllers/progressController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { validateProgressUpdate } from '../middlewares/progressValidation.js';

const router = Router();

// All progress endpoints require authentication
router.use(requireAuth);

/**
 * @route   POST /api/progress
 * @desc    Record or toggle progress on a topic / note / quiz / playground / keyPoint
 * @access  Private
 */
router.post('/', validateProgressUpdate, progressController.updateProgress);

/**
 * @route   GET /api/progress
 * @desc    Get current user's overarching progress across all learning paths
 * @access  Private
 */
router.get('/', progressController.getOverallProgress);

/**
 * @route   GET /api/progress/topic/:topicId
 * @desc    Get progress details and stats for a specific topic
 * @access  Private
 */
router.get('/topic/:topicId', progressController.getTopicProgress);

/**
 * @route   GET /api/progress/learning-path/:id
 * @desc    Get hierarchical progress for a full learning path with modules and sections
 * @access  Private
 */
router.get('/learning-path/:id', progressController.getLearningPathProgress);

/**
 * @route   GET /api/progress/module/:id
 * @desc    Get progress for a specific module and child sections
 * @access  Private
 */
router.get('/module/:id', progressController.getModuleProgress);

export default router;
