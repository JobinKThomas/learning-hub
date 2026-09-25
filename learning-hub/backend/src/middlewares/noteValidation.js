import { ApiError } from '../utils/apiError.js';

export const validateCreateNote = (req, res, next) => {
  const { title, topic, topicId, content, summary, readingTime, order, tags } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length < 1) {
    errors.push({
      field: 'title',
      message: 'Note title is required and must be at least 1 character',
    });
  } else if (title.trim().length > 150) {
    errors.push({
      field: 'title',
      message: 'Note title cannot exceed 150 characters',
    });
  }

  const topicRef = topic || topicId;
  if (!topicRef || typeof topicRef !== 'string' || !topicRef.trim()) {
    errors.push({
      field: 'topic',
      message: 'Parent topic identifier (ID or slug) is required',
    });
  }

  if (!content || typeof content !== 'string' || !content.trim()) {
    errors.push({
      field: 'content',
      message: 'Note content is required',
    });
  }

  if (summary && (typeof summary !== 'string' || summary.trim().length > 400)) {
    errors.push({
      field: 'summary',
      message: 'Summary cannot exceed 400 characters',
    });
  }

  if (readingTime && (typeof readingTime !== 'string' || !readingTime.trim())) {
    errors.push({
      field: 'readingTime',
      message: 'Reading time must be a non-empty string',
    });
  }

  if (order !== undefined && (typeof order !== 'number' || isNaN(order))) {
    errors.push({
      field: 'order',
      message: 'Note order must be a valid number',
    });
  }

  if (tags !== undefined && !Array.isArray(tags) && typeof tags !== 'string') {
    errors.push({
      field: 'tags',
      message: 'Tags must be an array or comma-separated string',
    });
  }

  if (errors.length > 0) {
    return next(new ApiError('Note validation failed', 400, errors));
  }

  next();
};

export const validateUpdateNote = (req, res, next) => {
  const { title, content, summary, readingTime, order, tags } = req.body;
  const errors = [];

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length < 1) {
      errors.push({
        field: 'title',
        message: 'Note title must be at least 1 character',
      });
    } else if (title.trim().length > 150) {
      errors.push({
        field: 'title',
        message: 'Note title cannot exceed 150 characters',
      });
    }
  }

  if (content !== undefined) {
    if (typeof content !== 'string' || !content.trim()) {
      errors.push({
        field: 'content',
        message: 'Note content cannot be empty',
      });
    }
  }

  if (summary !== undefined && (typeof summary !== 'string' || summary.trim().length > 400)) {
    errors.push({
      field: 'summary',
      message: 'Summary cannot exceed 400 characters',
    });
  }

  if (readingTime !== undefined && (typeof readingTime !== 'string' || !readingTime.trim())) {
    errors.push({
      field: 'readingTime',
      message: 'Reading time must be a non-empty string',
    });
  }

  if (order !== undefined && (typeof order !== 'number' || isNaN(order))) {
    errors.push({
      field: 'order',
      message: 'Note order must be a valid number',
    });
  }

  if (tags !== undefined && !Array.isArray(tags) && typeof tags !== 'string') {
    errors.push({
      field: 'tags',
      message: 'Tags must be an array or comma-separated string',
    });
  }

  if (errors.length > 0) {
    return next(new ApiError('Note validation failed', 400, errors));
  }

  next();
};
