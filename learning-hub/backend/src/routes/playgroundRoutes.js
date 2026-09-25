import { Router } from 'express';
import { playgroundController } from '../controllers/playgroundController.js';
import { requireAuth, requireAdmin } from '../middlewares/authMiddleware.js';
import {
  validateCreatePlayground,
  validateUpdatePlayground,
  validateRunCode,
} from '../middlewares/playgroundValidation.js';

const router = Router();

// All playground routes require authentication
router.use(requireAuth);

/**
 * @openapi
 * /playgrounds:
 *   get:
 *     summary: List all playgrounds
 *     tags:
 *       - Playgrounds
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: topic
 *         schema:
 *           type: string
 *         description: Topic ID or slug
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of playgrounds
 *       401:
 *         description: Unauthorized
 */
router.get('/', playgroundController.getAll);

/**
 * @openapi
 * /playgrounds/run:
 *   post:
 *     summary: Execute JavaScript code in a controlled sandboxed subprocess
 *     tags:
 *       - Playgrounds
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *               language:
 *                 type: string
 *                 default: javascript
 *               playgroundId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Execution result with stdout logs and execution time
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/run', validateRunCode, playgroundController.runCode);

/**
 * @openapi
 * /playgrounds/{id}/run:
 *   post:
 *     summary: Execute code for a specific playground challenge
 *     tags:
 *       - Playgrounds
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *               language:
 *                 type: string
 *     responses:
 *       200:
 *         description: Execution result with expected output comparison
 */
router.post('/:id/run', validateRunCode, playgroundController.runCode);

/**
 * @openapi
 * /playgrounds/id/{id}:
 *   get:
 *     summary: Get playground by ID
 *     tags:
 *       - Playgrounds
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
 *         description: Playground details
 *       404:
 *         description: Playground not found
 */
router.get('/id/:id', playgroundController.getById);

/**
 * @openapi
 * /playgrounds/{slug}:
 *   get:
 *     summary: Get playground by slug
 *     tags:
 *       - Playgrounds
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
 *         description: Playground details
 *       404:
 *         description: Playground not found
 */
router.get('/:slug', playgroundController.getBySlug);

/**
 * @openapi
 * /playgrounds:
 *   post:
 *     summary: Create new playground (Admin only)
 *     tags:
 *       - Playgrounds
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
 *               - initialCode
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               topic:
 *                 type: string
 *               description:
 *                 type: string
 *               instructions:
 *                 type: string
 *               initialCode:
 *                 type: string
 *               solutionCode:
 *                 type: string
 *               expectedOutput:
 *                 type: string
 *               hints:
 *                 type: array
 *                 items:
 *                   type: string
 *               language:
 *                 type: string
 *                 default: javascript
 *               difficulty:
 *                 type: string
 *                 default: BEGINNER
 *               order:
 *                 type: number
 *               published:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Playground created
 *       403:
 *         description: Forbidden - Admin only
 */
router.post('/', requireAdmin, validateCreatePlayground, playgroundController.create);

/**
 * @openapi
 * /playgrounds/{id}:
 *   put:
 *     summary: Update playground (Admin only)
 *     tags:
 *       - Playgrounds
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
 *         description: Playground updated
 *       403:
 *         description: Forbidden - Admin only
 */
router.put('/:id', requireAdmin, validateUpdatePlayground, playgroundController.update);

/**
 * @openapi
 * /playgrounds/{id}:
 *   delete:
 *     summary: Delete playground (Admin only)
 *     tags:
 *       - Playgrounds
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
 *         description: Playground deleted
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete('/:id', requireAdmin, playgroundController.delete);

export default router;
