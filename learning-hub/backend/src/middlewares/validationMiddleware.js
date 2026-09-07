import { ApiError } from '../utils/apiError.js';

const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

/**
 * Validate registration payload
 */
export const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body || {};
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters long' });
  } else if (name.trim().length > 50) {
    errors.push({ field: 'name', message: 'Name cannot exceed 50 characters' });
  }

  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    errors.push({ field: 'email', message: 'Please provide a valid email address' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
  }

  if (role && !['student', 'instructor', 'admin'].includes(role)) {
    errors.push({ field: 'role', message: "Role must be 'student', 'instructor', or 'admin'" });
  }

  if (errors.length > 0) {
    return next(new ApiError('Validation failed', 400, errors));
  }

  next();
};

/**
 * Validate login payload
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};
  const errors = [];

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  }

  if (!password || typeof password !== 'string' || !password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  if (errors.length > 0) {
    return next(new ApiError('Validation failed', 400, errors));
  }

  next();
};

/**
 * Validate refresh token presence
 */
export const validateRefresh = (req, res, next) => {
  const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken;

  if (!refreshToken) {
    return next(new ApiError('Refresh token is required in request body or cookie', 400));
  }

  req.refreshToken = refreshToken;
  next();
};
