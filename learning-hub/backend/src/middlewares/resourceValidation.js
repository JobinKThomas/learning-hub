import { ApiError } from '../utils/apiError.js';
import { RESOURCE_TYPES } from '../models/Resource.js';

const urlRegex = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;

export const validateCreateResource = (req, res, next) => {
  const { title, url, topic, topicId, type, description, author, order } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length < 1) {
    errors.push({
      field: 'title',
      message: 'Resource title is required and must be at least 1 character',
    });
  } else if (title.trim().length > 150) {
    errors.push({
      field: 'title',
      message: 'Resource title cannot exceed 150 characters',
    });
  }

  if (!url || typeof url !== 'string' || !url.trim()) {
    errors.push({
      field: 'url',
      message: 'Resource URL is required',
    });
  } else if (!urlRegex.test(url.trim())) {
    errors.push({
      field: 'url',
      message: 'Resource URL must be a valid HTTP or HTTPS address',
    });
  }

  const topicRef = topic || topicId;
  if (!topicRef || typeof topicRef !== 'string' || !topicRef.trim()) {
    errors.push({
      field: 'topic',
      message: 'Parent topic identifier (ID or slug) is required',
    });
  }

  if (type !== undefined && !RESOURCE_TYPES.includes(type.toUpperCase().trim())) {
    errors.push({
      field: 'type',
      message: `Type must be one of: ${RESOURCE_TYPES.join(', ')}`,
    });
  }

  if (description && (typeof description !== 'string' || description.trim().length > 500)) {
    errors.push({
      field: 'description',
      message: 'Description cannot exceed 500 characters',
    });
  }

  if (author && (typeof author !== 'string' || author.trim().length > 100)) {
    errors.push({
      field: 'author',
      message: 'Author cannot exceed 100 characters',
    });
  }

  if (order !== undefined && (typeof order !== 'number' || isNaN(order))) {
    errors.push({
      field: 'order',
      message: 'Resource order must be a valid number',
    });
  }

  if (errors.length > 0) {
    return next(new ApiError('Resource validation failed', 400, errors));
  }

  next();
};

export const validateUpdateResource = (req, res, next) => {
  const { title, url, type, description, author, order } = req.body;
  const errors = [];

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length < 1) {
      errors.push({
        field: 'title',
        message: 'Resource title must be at least 1 character',
      });
    } else if (title.trim().length > 150) {
      errors.push({
        field: 'title',
        message: 'Resource title cannot exceed 150 characters',
      });
    }
  }

  if (url !== undefined) {
    if (typeof url !== 'string' || !url.trim() || !urlRegex.test(url.trim())) {
      errors.push({
        field: 'url',
        message: 'Resource URL must be a valid HTTP or HTTPS address',
      });
    }
  }

  if (type !== undefined && !RESOURCE_TYPES.includes(type.toUpperCase().trim())) {
    errors.push({
      field: 'type',
      message: `Type must be one of: ${RESOURCE_TYPES.join(', ')}`,
    });
  }

  if (description !== undefined && (typeof description !== 'string' || description.trim().length > 500)) {
    errors.push({
      field: 'description',
      message: 'Description cannot exceed 500 characters',
    });
  }

  if (author !== undefined && (typeof author !== 'string' || author.trim().length > 100)) {
    errors.push({
      field: 'author',
      message: 'Author cannot exceed 100 characters',
    });
  }

  if (order !== undefined && (typeof order !== 'number' || isNaN(order))) {
    errors.push({
      field: 'order',
      message: 'Resource order must be a valid number',
    });
  }

  if (errors.length > 0) {
    return next(new ApiError('Resource validation failed', 400, errors));
  }

  next();
};
