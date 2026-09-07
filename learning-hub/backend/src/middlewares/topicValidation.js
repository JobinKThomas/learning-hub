import { ApiError } from '../utils/apiError.js';

export const validateCreateTopic = (req, res, next) => {
  const { title, section, sectionId, description, summary, duration, order, codeExamples, keyPoints } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length < 1) {
    errors.push({
      field: 'title',
      message: 'Topic title is required and must be at least 1 character',
    });
  } else if (title.trim().length > 120) {
    errors.push({
      field: 'title',
      message: 'Topic title cannot exceed 120 characters',
    });
  }

  const sectionRef = section || sectionId;
  if (!sectionRef || typeof sectionRef !== 'string' || !sectionRef.trim()) {
    errors.push({
      field: 'section',
      message: 'Parent section identifier (ID or slug) is required',
    });
  }

  if (!description || typeof description !== 'string' || !description.trim()) {
    errors.push({
      field: 'description',
      message: 'Topic description is required',
    });
  } else if (description.trim().length > 2000) {
    errors.push({
      field: 'description',
      message: 'Description cannot exceed 2000 characters',
    });
  }

  if (summary && (typeof summary !== 'string' || summary.trim().length > 300)) {
    errors.push({
      field: 'summary',
      message: 'Summary cannot exceed 300 characters',
    });
  }

  if (order !== undefined && (typeof order !== 'number' || isNaN(order))) {
    errors.push({
      field: 'order',
      message: 'Topic order must be a valid number',
    });
  }

  if (codeExamples !== undefined && !Array.isArray(codeExamples)) {
    errors.push({
      field: 'codeExamples',
      message: 'Code examples must be an array',
    });
  }

  if (keyPoints !== undefined && !Array.isArray(keyPoints)) {
    errors.push({
      field: 'keyPoints',
      message: 'Key points must be an array of strings',
    });
  }

  if (errors.length > 0) {
    return next(new ApiError('Topic validation failed', 400, errors));
  }

  next();
};

export const validateUpdateTopic = (req, res, next) => {
  const { title, description, summary, order, codeExamples, keyPoints } = req.body;
  const errors = [];

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length < 1) {
      errors.push({
        field: 'title',
        message: 'Topic title must be at least 1 character',
      });
    } else if (title.trim().length > 120) {
      errors.push({
        field: 'title',
        message: 'Topic title cannot exceed 120 characters',
      });
    }
  }

  if (description !== undefined) {
    if (typeof description !== 'string' || !description.trim()) {
      errors.push({
        field: 'description',
        message: 'Topic description cannot be empty',
      });
    } else if (description.trim().length > 2000) {
      errors.push({
        field: 'description',
        message: 'Description cannot exceed 2000 characters',
      });
    }
  }

  if (summary !== undefined && (typeof summary !== 'string' || summary.trim().length > 300)) {
    errors.push({
      field: 'summary',
      message: 'Summary cannot exceed 300 characters',
    });
  }

  if (order !== undefined && (typeof order !== 'number' || isNaN(order))) {
    errors.push({
      field: 'order',
      message: 'Topic order must be a valid number',
    });
  }

  if (codeExamples !== undefined && !Array.isArray(codeExamples)) {
    errors.push({
      field: 'codeExamples',
      message: 'Code examples must be an array',
    });
  }

  if (keyPoints !== undefined && !Array.isArray(keyPoints)) {
    errors.push({
      field: 'keyPoints',
      message: 'Key points must be an array of strings',
    });
  }

  if (errors.length > 0) {
    return next(new ApiError('Topic validation failed', 400, errors));
  }

  next();
};
