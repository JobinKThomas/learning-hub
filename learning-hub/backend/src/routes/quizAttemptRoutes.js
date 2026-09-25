import { Router } from 'express';
import { quizAttemptController } from '../controllers/quizAttemptController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();

// All quiz attempt endpoints require authentication
router.use(requireAuth);

/**
 * @openapi
 * /quiz-attempts:
 *   get:
 *     summary: Get all quiz attempts for the authenticated user
 *     tags:
 *       - Quiz Attempts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: Optional user ID filter (Admin only)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of quiz attempts
 *       401:
 *         description: Unauthorized
 */
router.get('/', quizAttemptController.getAllAttempts);

/**
 * @openapi
 * /quiz-attempts/{id}:
 *   get:
 *     summary: Get detailed quiz attempt by ID with question review
 *     tags:
 *       - Quiz Attempts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detailed quiz attempt with snapshotted answers and explanations
 *       403:
 *         description: Forbidden - Not the attempt owner
 *       404:
 *         description: Quiz attempt not found
 */
router.get('/:id', quizAttemptController.getAttemptById);

export default router;
