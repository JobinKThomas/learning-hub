import { ApiError } from '../utils/apiError.js';

export const validateCreateModule = (req, res, next) => {
  const { title, learningPath, learningPathId, description, duration, order, topics } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length < 2) {
    errors.push({
      field: 'title',
      message: 'Module title is required and must be at least 2 characters',
    });
  } else if (title.trim().length > 120) {
    errors.push({
      field: 'title',
      message: 'Module title cannot exceed 120 characters',
    });
  }

  const pathRef = learningPath || learningPathId;
  if (!pathRef || typeof pathRef !== 'string' || !pathRef.trim()) {
    errors.push({
      field: 'learningPath',
      message: 'Parent learning path identifier (ID or slug) is required',
    });
  }

  if (!description || typeof description !== 'string' || !description.trim()) {
    errors.push({
      field: 'description',
      message: 'Module description is required',
    });
  } else if (description.trim().length > 1000) {
    errors.push({
      field: 'description',
      message: 'Description cannot exceed 1000 characters',
    });
  }

  if (order !== undefined && (typeof order !== 'number' || isNaN(order))) {
    errors.push({
      field: 'order',
      message: 'Module order must be a valid number',
    });
  }

  if (topics !== undefined && !Array.isArray(topics)) {
    errors.push({
      field: 'topics',
      message: 'Topics must be an array of strings',
    });
  }

  if (errors.length > 0) {
    return next(new ApiError('Module validation failed', 400, errors));
  }

  next();
};

export const validateUpdateModule = (req, res, next) => {
  const { title, description, order, topics } = req.body;
  const errors = [];

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length < 2) {
      errors.push({
        field: 'title',
        message: 'Module title must be at least 2 characters',
      });
    } else if (title.trim().length > 120) {
      errors.push({
        field: 'title',
        message: 'Module title cannot exceed 120 characters',
      });
    }
  }

  if (description !== undefined) {
    if (typeof description !== 'string' || !description.trim()) {
      errors.push({
        field: 'description',
        message: 'Module description cannot be empty',
      });
    } else if (description.trim().length > 1000) {
      errors.push({
        field: 'description',
        message: 'Description cannot exceed 1000 characters',
      });
    }
  }

  if (order !== undefined && (typeof order !== 'number' || isNaN(order))) {
    errors.push({
      field: 'order',
      message: 'Module order must be a valid number',
    });
  }

  if (topics !== undefined && !Array.isArray(topics)) {
    errors.push({
      field: 'topics',
      message: 'Topics must be an array of strings',
    });
  }

  if (errors.length > 0) {
    return next(new ApiError('Module validation failed', 400, errors));
  }

  next();
};
