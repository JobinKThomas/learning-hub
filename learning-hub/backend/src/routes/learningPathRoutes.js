import { Router } from 'express';
import { learningPathController } from '../controllers/learningPathController.js';
import { requireAuth, requireAdmin } from '../middlewares/authMiddleware.js';
import {
  validateCreateLearningPath,
  validateUpdateLearningPath,
} from '../middlewares/learningPathValidation.js';

const router = Router();

// All learning path routes require authentication
router.use(requireAuth);

/**
 * @openapi
 * /learning-paths:
 *   get:
 *     summary: Get all learning paths
 *     tags:
 *       - Learning Paths
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [Beginner, Intermediate, Advanced]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of learning paths
 *       401:
 *         description: Unauthorized
 */
router.get('/', learningPathController.getAll);

/**
 * @openapi
 * /learning-paths/id/{id}:
 *   get:
 *     summary: Get learning path by ID
 *     tags:
 *       - Learning Paths
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
 *         description: Learning path details
 *       404:
 *         description: Not found
 */
router.get('/id/:id', learningPathController.getById);

/**
 * @openapi
 * /learning-paths/{slug}:
 *   get:
 *     summary: Get learning path details by unique slug
 *     tags:
 *       - Learning Paths
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           example: javascript
 *     responses:
 *       200:
 *         description: Learning path details with full modules
 *       404:
 *         description: Learning path not found
 */
router.get('/:slug', learningPathController.getBySlug);

/**
 * @openapi
 * /learning-paths:
 *   post:
 *     summary: Create a new learning path (Admin only)
 *     tags:
 *       - Learning Paths
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 example: JavaScript Mastery
 *               slug:
 *                 type: string
 *                 example: javascript
 *               description:
 *                 type: string
 *                 example: Comprehensive track covering modern ES6+, async JS, and Web APIs.
 *               category:
 *                 type: string
 *                 example: Web Development
 *               level:
 *                 type: string
 *                 enum: [Beginner, Intermediate, Advanced]
 *                 example: Beginner
 *               estimatedHours:
 *                 type: number
 *                 example: 25
 *               modules:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title: { type: string }
 *                     description: { type: string }
 *                     duration: { type: string }
 *                     topics: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Learning path created successfully
 *       403:
 *         description: Forbidden (Non-admin)
 */
router.post(
  '/',
  requireAdmin,
  validateCreateLearningPath,
  learningPathController.create
);

/**
 * @openapi
 * /learning-paths/{id}:
 *   put:
 *     summary: Update an existing learning path (Admin only)
 *     tags:
 *       - Learning Paths
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
 *         description: Learning path updated successfully
 *       403:
 *         description: Forbidden (Non-admin)
 *       404:
 *         description: Learning path not found
 */
router.put(
  '/:id',
  requireAdmin,
  validateUpdateLearningPath,
  learningPathController.update
);

/**
 * @openapi
 * /learning-paths/{id}:
 *   delete:
 *     summary: Delete a learning path (Admin only)
 *     tags:
 *       - Learning Paths
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
 *         description: Learning path deleted successfully
 *       403:
 *         description: Forbidden (Non-admin)
 *       404:
 *         description: Learning path not found
 */
router.delete('/:id', requireAdmin, learningPathController.remove);

export default router;
