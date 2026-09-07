import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
  try {
    // Attempt database connection
    try {
      await connectDB();
    } catch (dbError) {
      console.warn(`[Server] Warning: Database connection failed on startup (${dbError.message}). Starting server in degraded mode...`);
    }

    server = app.listen(PORT, () => {
      console.log(`[Server] Learning Hub backend running on http://localhost:${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[Server] Health check available at: http://localhost:${PORT}/api/health`);
      console.log(`[Server] Swagger Docs available at: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error(`[Server] Critical startup error: ${error.message}`);
    process.exit(1);
  }
};

startServer();

// Handle graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
  if (server) {
    setTimeout(async () => {
      await disconnectDB();
      process.exit(0);
    }, 1000).unref();

    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      await disconnectDB();
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  console.error('[Server] Unhandled Rejection:', err);
});
