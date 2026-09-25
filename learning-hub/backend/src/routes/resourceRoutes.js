import { Router } from 'express';
import { resourceController } from '../controllers/resourceController.js';
import { requireAuth, requireAdmin } from '../middlewares/authMiddleware.js';
import {
  validateCreateResource,
  validateUpdateResource,
} from '../middlewares/resourceValidation.js';

const router = Router();

// All resource routes require authentication
router.use(requireAuth);

/**
 * @openapi
 * /resources:
 *   get:
 *     summary: Get all resources (optionally filtered by topic, type, or search)
 *     tags:
 *       - Resources
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: topic
 *         schema:
 *           type: string
 *         description: Optional topic ID or slug filter
 *       - in: query
 *         name: topicId
 *         schema:
 *           type: string
 *         description: Optional topic ID or slug filter
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Optional resource type filter (DOCUMENTATION, VIDEO, ARTICLE, GITHUB, COURSE, TOOL, OTHER)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Optional search text
 *     responses:
 *       200:
 *         description: List of resources
 *       401:
 *         description: Unauthorized
 */
router.get('/', resourceController.getAll);

/**
 * @openapi
 * /resources/{id}:
 *   get:
 *     summary: Get resource by ID
 *     tags:
 *       - Resources
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
 *         description: Resource details
 *       404:
 *         description: Resource not found
 */
router.get('/:id', resourceController.getById);

/**
 * @openapi
 * /resources:
 *   post:
 *     summary: Create new resource (Admin only)
 *     tags:
 *       - Resources
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
 *               - url
 *               - topic
 *             properties:
 *               title:
 *                 type: string
 *               url:
 *                 type: string
 *               topic:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [DOCUMENTATION, VIDEO, ARTICLE, GITHUB, COURSE, TOOL, OTHER]
 *               description:
 *                 type: string
 *               author:
 *                 type: string
 *               order:
 *                 type: number
 *               isFree:
 *                 type: boolean
 *               published:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Resource created
 *       403:
 *         description: Forbidden - Admin only
 */
router.post('/', requireAdmin, validateCreateResource, resourceController.create);

/**
 * @openapi
 * /resources/{id}:
 *   put:
 *     summary: Update resource (Admin only)
 *     tags:
 *       - Resources
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
 *         description: Resource updated
 *       403:
 *         description: Forbidden - Admin only
 */
router.put('/:id', requireAdmin, validateUpdateResource, resourceController.update);

/**
 * @openapi
 * /resources/{id}:
 *   delete:
 *     summary: Delete resource (Admin only)
 *     tags:
 *       - Resources
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
 *         description: Resource deleted
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete('/:id', requireAdmin, resourceController.delete);

export default router;
