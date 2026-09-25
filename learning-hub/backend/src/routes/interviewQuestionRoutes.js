import { Router } from 'express';
import { interviewQuestionController } from '../controllers/interviewQuestionController.js';
import { requireAuth, requireAdmin } from '../middlewares/authMiddleware.js';
import {
  validateCreateInterviewQuestion,
  validateUpdateInterviewQuestion,
} from '../middlewares/interviewQuestionValidation.js';

const router = Router();

// All interview question endpoints require authentication
router.use(requireAuth);

/**
 * @openapi
 * /interview-questions:
 *   get:
 *     summary: List all interview questions
 *     tags:
 *       - Interview Questions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: topic
 *         schema:
 *           type: string
 *         description: Topic ID or slug
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [BEGINNER, INTERMEDIATE, ADVANCED]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of interview questions
 *       401:
 *         description: Unauthorized
 */
router.get('/', interviewQuestionController.getAll);

/**
 * @openapi
 * /interview-questions/{id}:
 *   get:
 *     summary: Get single interview question by ID
 *     tags:
 *       - Interview Questions
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
 *         description: Interview question details with answer
 *       404:
 *         description: Interview question not found
 */
router.get('/:id', interviewQuestionController.getById);

/**
 * @openapi
 * /interview-questions:
 *   post:
 *     summary: Create new interview question (Admin only)
 *     tags:
 *       - Interview Questions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topic
 *               - question
 *               - answer
 *             properties:
 *               topic:
 *                 type: string
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *               codeSnippet:
 *                 type: string
 *               difficulty:
 *                 type: string
 *                 enum: [BEGINNER, INTERMEDIATE, ADVANCED]
 *               frequency:
 *                 type: string
 *                 enum: [FREQUENT, COMMON, RARE]
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
 *         description: Interview question created
 *       403:
 *         description: Forbidden - Admin only
 */
router.post(
  '/',
  requireAdmin,
  validateCreateInterviewQuestion,
  interviewQuestionController.create
);

/**
 * @openapi
 * /interview-questions/{id}:
 *   put:
 *     summary: Update interview question (Admin only)
 *     tags:
 *       - Interview Questions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Interview question updated
 *       403:
 *         description: Forbidden - Admin only
 */
router.put(
  '/:id',
  requireAdmin,
  validateUpdateInterviewQuestion,
  interviewQuestionController.update
);

/**
 * @openapi
 * /interview-questions/{id}:
 *   delete:
 *     summary: Delete interview question (Admin only)
 *     tags:
 *       - Interview Questions
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
 *         description: Interview question deleted
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete('/:id', requireAdmin, interviewQuestionController.delete);

export default router;
