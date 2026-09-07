import { Router } from 'express';
import { topicController } from '../controllers/topicController.js';
import { noteController } from '../controllers/noteController.js';
import { resourceController } from '../controllers/resourceController.js';
import { requireAuth, requireAdmin } from '../middlewares/authMiddleware.js';
import {
  validateCreateTopic,
  validateUpdateTopic,
} from '../middlewares/topicValidation.js';

const router = Router();

// All topic routes require authentication
router.use(requireAuth);

/**
 * @openapi
 * /topics:
 *   get:
 *     summary: Get all topics
 *     tags:
 *       - Topics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: section
 *         schema:
 *           type: string
 *         description: Optional section ID or slug filter
 *       - in: query
 *         name: sectionId
 *         schema:
 *           type: string
 *         description: Optional section ID or slug filter
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of topics
 *       401:
 *         description: Unauthorized
 */
router.get('/', topicController.getAll);

/**
 * @openapi
 * /topics/id/{id}:
 *   get:
 *     summary: Get topic by ID
 *     tags:
 *       - Topics
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
 *         description: Topic details
 *       404:
 *         description: Topic not found
 */
router.get('/id/:id', topicController.getById);

/**
 * @openapi
 * /topics/{topicId}/notes:
 *   get:
 *     summary: Get all notes belonging to a topic
 *     tags:
 *       - Topics
 *       - Notes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic ID or slug
 *     responses:
 *       200:
 *         description: List of notes for topic
 *       404:
 *         description: Topic not found
 */
router.get('/:topicId/notes', noteController.getByTopic);

/**
 * @openapi
 * /topics/{topicId}/resources:
 *   get:
 *     summary: Get all resources belonging to a topic
 *     tags:
 *       - Topics
 *       - Resources
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic ID or slug
 *     responses:
 *       200:
 *         description: List of resources for topic
 *       404:
 *         description: Topic not found
 */
router.get('/:topicId/resources', resourceController.getByTopic);

/**
 * @openapi
 * /topics/{slug}:
 *   get:
 *     summary: Get topic details by slug
 *     tags:
 *       - Topics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Topic details
 *       404:
 *         description: Topic not found
 */
router.get('/:slug', topicController.getBySlug);

/**
 * @openapi
 * /topics:
 *   post:
 *     summary: Create new topic (Admin only)
 *     tags:
 *       - Topics
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
 *               - section
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               section:
 *                 type: string
 *               summary:
 *                 type: string
 *               description:
 *                 type: string
 *               duration:
 *                 type: string
 *               order:
 *                 type: number
 *               codeExamples:
 *                 type: array
 *                 items:
 *                   type: object
 *               keyPoints:
 *                 type: array
 *                 items:
 *                   type: string
 *               content:
 *                 type: string
 *               published:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Topic created
 *       403:
 *         description: Forbidden - Admin only
 */
router.post('/', requireAdmin, validateCreateTopic, topicController.create);

/**
 * @openapi
 * /topics/{id}:
 *   put:
 *     summary: Update topic (Admin only)
 *     tags:
 *       - Topics
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
 *         description: Topic updated
 *       403:
 *         description: Forbidden - Admin only
 */
router.put('/:id', requireAdmin, validateUpdateTopic, topicController.update);

/**
 * @openapi
 * /topics/{id}:
 *   delete:
 *     summary: Delete topic (Admin only)
 *     tags:
 *       - Topics
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
 *         description: Topic deleted
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete('/:id', requireAdmin, topicController.delete);

export default router;
