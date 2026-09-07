import { Router } from 'express';
import { moduleController } from '../controllers/moduleController.js';
import { requireAuth, requireAdmin } from '../middlewares/authMiddleware.js';
import {
  validateCreateModule,
  validateUpdateModule,
} from '../middlewares/moduleValidation.js';

const router = Router();

// All module routes require authentication
router.use(requireAuth);

/**
 * @openapi
 * /modules:
 *   get:
 *     summary: Get all modules
 *     tags:
 *       - Modules
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: learningPathId
 *         schema:
 *           type: string
 *         description: Optional learning path ID or slug filter
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of modules
 *       401:
 *         description: Unauthorized
 */
router.get('/', moduleController.getAll);

/**
 * @openapi
 * /modules/id/{id}:
 *   get:
 *     summary: Get module by ID
 *     tags:
 *       - Modules
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
 *         description: Module details
 *       404:
 *         description: Module not found
 */
router.get('/id/:id', moduleController.getById);

/**
 * @openapi
 * /modules/{slug}:
 *   get:
 *     summary: Get module details by slug
 *     tags:
 *       - Modules
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
 *         description: Module details
 *       404:
 *         description: Module not found
 */
router.get('/:slug', moduleController.getBySlug);

/**
 * @openapi
 * /modules:
 *   post:
 *     summary: Create new module (Admin only)
 *     tags:
 *       - Modules
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
 *               - learningPath
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               learningPath:
 *                 type: string
 *               description:
 *                 type: string
 *               duration:
 *                 type: string
 *               order:
 *                 type: number
 *               topics:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Module created
 *       403:
 *         description: Forbidden - Admin only
 */
router.post('/', requireAdmin, validateCreateModule, moduleController.create);

/**
 * @openapi
 * /modules/{id}:
 *   put:
 *     summary: Update module (Admin only)
 *     tags:
 *       - Modules
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
 *         description: Module updated
 *       403:
 *         description: Forbidden - Admin only
 */
router.put('/:id', requireAdmin, validateUpdateModule, moduleController.update);

/**
 * @openapi
 * /modules/{id}:
 *   delete:
 *     summary: Delete module (Admin only)
 *     tags:
 *       - Modules
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
 *         description: Module deleted
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete('/:id', requireAdmin, moduleController.delete);

export default router;
