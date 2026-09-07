import { Router } from 'express';
import { sectionController } from '../controllers/sectionController.js';
import { requireAuth, requireAdmin } from '../middlewares/authMiddleware.js';
import {
  validateCreateSection,
  validateUpdateSection,
} from '../middlewares/sectionValidation.js';

const router = Router();

// All section routes require authentication
router.use(requireAuth);

/**
 * @openapi
 * /sections:
 *   get:
 *     summary: Get all sections
 *     tags:
 *       - Sections
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: moduleId
 *         schema:
 *           type: string
 *         description: Optional module ID or slug filter
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of sections
 *       401:
 *         description: Unauthorized
 */
router.get('/', sectionController.getAll);

/**
 * @openapi
 * /sections/id/{id}:
 *   get:
 *     summary: Get section by ID
 *     tags:
 *       - Sections
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
 *         description: Section details
 *       404:
 *         description: Section not found
 */
router.get('/id/:id', sectionController.getById);

/**
 * @openapi
 * /sections/{slug}:
 *   get:
 *     summary: Get section details by slug
 *     tags:
 *       - Sections
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
 *         description: Section details
 *       404:
 *         description: Section not found
 */
router.get('/:slug', sectionController.getBySlug);

/**
 * @openapi
 * /sections:
 *   post:
 *     summary: Create new section (Admin only)
 *     tags:
 *       - Sections
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
 *               - module
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               module:
 *                 type: string
 *               description:
 *                 type: string
 *               duration:
 *                 type: string
 *               order:
 *                 type: number
 *               items:
 *                 type: array
 *                 items:
 *                   type: string
 *               content:
 *                 type: string
 *               published:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Section created
 *       403:
 *         description: Forbidden - Admin only
 */
router.post('/', requireAdmin, validateCreateSection, sectionController.create);

/**
 * @openapi
 * /sections/{id}:
 *   put:
 *     summary: Update section (Admin only)
 *     tags:
 *       - Sections
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
 *         description: Section updated
 *       403:
 *         description: Forbidden - Admin only
 */
router.put('/:id', requireAdmin, validateUpdateSection, sectionController.update);

/**
 * @openapi
 * /sections/{id}:
 *   delete:
 *     summary: Delete section (Admin only)
 *     tags:
 *       - Sections
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
 *         description: Section deleted
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete('/:id', requireAdmin, sectionController.delete);

export default router;
