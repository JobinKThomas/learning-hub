import { ApiError } from '../utils/apiError.js';
import { sendError } from '../utils/apiResponse.js';

/**
 * 404 Route Not Found Handler
 */
export const notFoundHandler = (req, res, next) => {
  const error = new ApiError(`Route not found: ${req.method} ${req.originalUrl}`, 404);
  next(error);
};

/**
 * Centralized Error Handler
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    message = `Resource not found with id: ${err.value}`;
    statusCode = 404;
  }

  // Handle Mongoose duplicate key error (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value entered for ${field}. Please use another value.`;
    statusCode = 409;
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    message = 'Validation failed';
    statusCode = 400;
    errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message,
    }));
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid authentication token';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Authentication token has expired';
    statusCode = 401;
  }

  if (process.env.NODE_ENV !== 'test' && statusCode === 500) {
    console.error('[Error Middleware]', err);
  }

  return sendError(res, message, errors, statusCode, err.stack);
};
