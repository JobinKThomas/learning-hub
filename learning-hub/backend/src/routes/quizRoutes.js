import { Router } from 'express';
import { quizController } from '../controllers/quizController.js';
import { quizAttemptController } from '../controllers/quizAttemptController.js';
import { requireAuth, requireAdmin } from '../middlewares/authMiddleware.js';
import {
  validateCreateQuiz,
  validateUpdateQuiz,
  validateSubmitQuiz,
} from '../middlewares/quizValidation.js';
import { validateCreateAttempt } from '../middlewares/quizAttemptValidation.js';

const router = Router();

// All quiz routes require authentication
router.use(requireAuth);

/**
 * @openapi
 * /quizzes:
 *   get:
 *     summary: List all quizzes
 *     tags:
 *       - Quizzes
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
 *         description: List of quizzes
 *       401:
 *         description: Unauthorized
 */
router.get('/', quizController.getAll);

/**
 * @openapi
 * /quizzes/{id}:
 *   get:
 *     summary: Get quiz by ID or slug
 *     tags:
 *       - Quizzes
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
 *         description: Quiz details
 *       404:
 *         description: Quiz not found
 */
router.get('/:id', quizController.getById);

/**
 * @openapi
 * /quizzes/{id}/submit:
 *   post:
 *     summary: Submit quiz answers for scoring and review
 *     tags:
 *       - Quizzes
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
 *               - answers
 *             properties:
 *               answers:
 *                 type: object
 *                 description: Map of questionId -> selectedOption index
 *     responses:
 *       200:
 *         description: Quiz evaluation result with score and explanations
 */
router.post('/:id/submit', validateSubmitQuiz, quizController.submitQuiz);

/**
 * @openapi
 * /quizzes/{id}/attempts:
 *   post:
 *     summary: Submit a quiz attempt, evaluate answers, and persist attempt record
 *     tags:
 *       - Quizzes
 *       - Quiz Attempts
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
 *               - answers
 *             properties:
 *               answers:
 *                 type: object
 *                 description: Map of questionId -> selectedOption index
 *               timeSpentSeconds:
 *                 type: number
 *                 description: Total seconds taken
 *     responses:
 *       201:
 *         description: Quiz attempt evaluated and recorded
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Quiz not found
 */
router.post('/:id/attempts', validateCreateAttempt, quizAttemptController.createAttempt);

/**
 * @openapi
 * /quizzes/{id}/attempts:
 *   get:
 *     summary: Get historical quiz attempts and statistics for a specific quiz
 *     tags:
 *       - Quizzes
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
 *         description: List of attempts and performance stats for this quiz
 *       404:
 *         description: Quiz not found
 */
router.get('/:id/attempts', quizAttemptController.getQuizAttempts);

/**
 * @openapi
 * /quizzes:
 *   post:
 *     summary: Create new quiz (Admin only)
 *     tags:
 *       - Quizzes
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
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               topic:
 *                 type: string
 *               description:
 *                 type: string
 *               passingScore:
 *                 type: number
 *                 default: 70
 *               timeLimitMinutes:
 *                 type: number
 *                 default: 10
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - question
 *                     - options
 *                     - correctAnswer
 *                   properties:
 *                     question:
 *                       type: string
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                     correctAnswer:
 *                       type: number
 *                     explanation:
 *                       type: string
 *                     codeSnippet:
 *                       type: string
 *     responses:
 *       201:
 *         description: Quiz created
 *       403:
 *         description: Forbidden - Admin only
 */
router.post('/', requireAdmin, validateCreateQuiz, quizController.create);

/**
 * @openapi
 * /quizzes/{id}:
 *   put:
 *     summary: Update quiz (Admin only)
 *     tags:
 *       - Quizzes
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
 *         description: Quiz updated
 *       403:
 *         description: Forbidden - Admin only
 */
router.put('/:id', requireAdmin, validateUpdateQuiz, quizController.update);

/**
 * @openapi
 * /quizzes/{id}:
 *   delete:
 *     summary: Delete quiz (Admin only)
 *     tags:
 *       - Quizzes
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
 *         description: Quiz deleted
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete('/:id', requireAdmin, quizController.delete);

export default router;
