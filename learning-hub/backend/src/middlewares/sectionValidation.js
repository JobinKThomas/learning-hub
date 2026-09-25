import { ApiError } from '../utils/apiError.js';

export const validateCreateSection = (req, res, next) => {
  const { title, module, moduleId, description, duration, order, items, content, published } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length < 2) {
    errors.push({
      field: 'title',
      message: 'Section title is required and must be at least 2 characters',
    });
  } else if (title.trim().length > 120) {
    errors.push({
      field: 'title',
      message: 'Section title cannot exceed 120 characters',
    });
  }

  const moduleRef = module || moduleId;
  if (!moduleRef || typeof moduleRef !== 'string' || !moduleRef.trim()) {
    errors.push({
      field: 'module',
      message: 'Parent module identifier (ID or slug) is required',
    });
  }

  if (!description || typeof description !== 'string' || !description.trim()) {
    errors.push({
      field: 'description',
      message: 'Section description is required',
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
      message: 'Section order must be a valid number',
    });
  }

  if (items !== undefined && !Array.isArray(items)) {
    errors.push({
      field: 'items',
      message: 'Items must be an array of strings',
    });
  }

  if (errors.length > 0) {
    return next(new ApiError('Section validation failed', 400, errors));
  }

  next();
};

export const validateUpdateSection = (req, res, next) => {
  const { title, description, order, items } = req.body;
  const errors = [];

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length < 2) {
      errors.push({
        field: 'title',
        message: 'Section title must be at least 2 characters',
      });
    } else if (title.trim().length > 120) {
      errors.push({
        field: 'title',
        message: 'Section title cannot exceed 120 characters',
      });
    }
  }

  if (description !== undefined) {
    if (typeof description !== 'string' || !description.trim()) {
      errors.push({
        field: 'description',
        message: 'Section description cannot be empty',
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
      message: 'Section order must be a valid number',
    });
  }

  if (items !== undefined && !Array.isArray(items)) {
    errors.push({
      field: 'items',
      message: 'Items must be an array of strings',
    });
  }

  if (errors.length > 0) {
    return next(new ApiError('Section validation failed', 400, errors));
  }

  next();
};
