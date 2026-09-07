import { Router } from 'express';
import { noteController } from '../controllers/noteController.js';
import { requireAuth, requireAdmin } from '../middlewares/authMiddleware.js';
import {
  validateCreateNote,
  validateUpdateNote,
} from '../middlewares/noteValidation.js';

const router = Router();

// All note routes require authentication
router.use(requireAuth);

/**
 * @openapi
 * /notes:
 *   get:
 *     summary: Get all notes (optionally filtered by topic, tag, or search)
 *     tags:
 *       - Notes
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
 *         name: tag
 *         schema:
 *           type: string
 *         description: Optional tag filter
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Optional search text
 *     responses:
 *       200:
 *         description: List of notes
 *       401:
 *         description: Unauthorized
 */
router.get('/', noteController.getAll);

/**
 * @openapi
 * /notes/id/{id}:
 *   get:
 *     summary: Get note by ID
 *     tags:
 *       - Notes
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
 *         description: Note details
 *       404:
 *         description: Note not found
 */
router.get('/id/:id', noteController.getById);

/**
 * @openapi
 * /notes/{slug}:
 *   get:
 *     summary: Get note details by slug
 *     tags:
 *       - Notes
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
 *         description: Note details
 *       404:
 *         description: Note not found
 */
router.get('/:slug', noteController.getBySlug);

/**
 * @openapi
 * /notes:
 *   post:
 *     summary: Create new note (Admin only)
 *     tags:
 *       - Notes
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
 *               - topic
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               topic:
 *                 type: string
 *               content:
 *                 type: string
 *               summary:
 *                 type: string
 *               readingTime:
 *                 type: string
 *               order:
 *                 type: number
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               published:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Note created
 *       403:
 *         description: Forbidden - Admin only
 */
router.post('/', requireAdmin, validateCreateNote, noteController.create);

/**
 * @openapi
 * /notes/{id}:
 *   put:
 *     summary: Update note (Admin only)
 *     tags:
 *       - Notes
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
 *         description: Note updated
 *       403:
 *         description: Forbidden - Admin only
 */
router.put('/:id', requireAdmin, validateUpdateNote, noteController.update);

/**
 * @openapi
 * /notes/{id}:
 *   delete:
 *     summary: Delete note (Admin only)
 *     tags:
 *       - Notes
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
 *         description: Note deleted
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete('/:id', requireAdmin, noteController.delete);

export default router;
