import { getDbStatus } from '../config/db.js';
import { sendSuccess } from '../utils/apiResponse.js';

/**
 * @desc    Health check endpoint
 * @route   GET /api/health
 * @access  Public
 */
export const getHealth = (req, res) => {
  const dbStatus = getDbStatus();
  const uptimeSeconds = Math.floor(process.uptime());

  const healthData = {
    status: 'OK',
    uptime: uptimeSeconds,
    uptimeHuman: `${Math.floor(uptimeSeconds / 60)}m ${uptimeSeconds % 60}s`,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus.state,
      host: dbStatus.host,
      name: dbStatus.name,
      connected: dbStatus.state === 'connected',
    },
    version: process.env.npm_package_version || '1.0.0',
    nodeVersion: process.version,
  };

  return sendSuccess(res, 'System is healthy', healthData, 200);
};
