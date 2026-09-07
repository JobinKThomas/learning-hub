import { Router } from 'express';
import { getHealth } from '../controllers/healthController.js';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: System health check
 *     description: Returns the operating status of the backend API and MongoDB connection
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: System is operational
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: System is healthy
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: OK
 *                     uptime:
 *                       type: number
 *                       example: 42
 *                     timestamp:
 *                       type: string
 *                       example: '2026-09-07T11:15:00.000Z'
 *                     environment:
 *                       type: string
 *                       example: development
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: connected
 *                         connected:
 *                           type: boolean
 *                           example: true
 */
router.get('/', getHealth);

export default router;
