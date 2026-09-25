import { ApiError } from '../utils/apiError.js';

const VALID_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export const validateCreateLearningPath = (req, res, next) => {
  const { title, description, level, estimatedHours } = req.body || {};
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length < 2) {
    errors.push({ field: 'title', message: 'Title must be at least 2 characters long' });
  } else if (title.trim().length > 100) {
    errors.push({ field: 'title', message: 'Title cannot exceed 100 characters' });
  }

  if (!description || typeof description !== 'string' || description.trim().length < 5) {
    errors.push({ field: 'description', message: 'Description must be at least 5 characters long' });
  } else if (description.trim().length > 1000) {
    errors.push({ field: 'description', message: 'Description cannot exceed 1000 characters' });
  }

  if (level && !VALID_LEVELS.includes(level)) {
    errors.push({ field: 'level', message: "Level must be 'Beginner', 'Intermediate', or 'Advanced'" });
  }

  if (estimatedHours !== undefined && (typeof estimatedHours !== 'number' || estimatedHours <= 0)) {
    errors.push({ field: 'estimatedHours', message: 'Estimated hours must be a positive number' });
  }

  if (errors.length > 0) {
    return next(new ApiError('Validation failed', 400, errors));
  }

  next();
};

export const validateUpdateLearningPath = (req, res, next) => {
  const { title, description, level, estimatedHours } = req.body || {};
  const errors = [];

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length < 2) {
      errors.push({ field: 'title', message: 'Title must be at least 2 characters long' });
    } else if (title.trim().length > 100) {
      errors.push({ field: 'title', message: 'Title cannot exceed 100 characters' });
    }
  }

  if (description !== undefined) {
    if (typeof description !== 'string' || description.trim().length < 5) {
      errors.push({ field: 'description', message: 'Description must be at least 5 characters long' });
    } else if (description.trim().length > 1000) {
      errors.push({ field: 'description', message: 'Description cannot exceed 1000 characters' });
    }
  }

  if (level !== undefined && !VALID_LEVELS.includes(level)) {
    errors.push({ field: 'level', message: "Level must be 'Beginner', 'Intermediate', or 'Advanced'" });
  }

  if (estimatedHours !== undefined && (typeof estimatedHours !== 'number' || estimatedHours <= 0)) {
    errors.push({ field: 'estimatedHours', message: 'Estimated hours must be a positive number' });
  }

  if (errors.length > 0) {
    return next(new ApiError('Validation failed', 400, errors));
  }

  next();
};
