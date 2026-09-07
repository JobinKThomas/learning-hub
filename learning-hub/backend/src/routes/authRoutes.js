import { Router } from 'express';
import {
  register,
  login,
  refresh,
  logout,
  getMe,
} from '../controllers/authController.js';
import {
  validateRegister,
  validateLogin,
  validateRefresh,
} from '../middlewares/validationMiddleware.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: securePass123
 *               role:
 *                 type: string
 *                 enum: [student, instructor, admin]
 *                 example: student
 *     responses:
 *       201:
 *         description: User registered successfully with access and refresh tokens
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already in use
 */
router.post('/register', validateRegister, register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Authenticate user & issue tokens
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: securePass123
 *     responses:
 *       200:
 *         description: Login successful with access and refresh tokens
 *       400:
 *         description: Missing credentials
 *       401:
 *         description: Invalid email or password
 */
router.post('/login', validateLogin, login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Renew access token with refresh token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Tokens successfully rotated and renewed
 *       400:
 *         description: Refresh token missing
 *       401:
 *         description: Invalid or revoked refresh token
 */
router.post('/refresh', validateRefresh, refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Log out user & revoke refresh token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Successfully logged out
 */
router.post('/logout', logout);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *       401:
 *         description: Missing or invalid token
 */
router.get('/me', authenticate, getMe);

export default router;
