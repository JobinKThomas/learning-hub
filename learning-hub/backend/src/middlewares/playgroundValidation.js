export const validateCreatePlayground = (req, res, next) => {
  const { title, topic, topicId, language, difficulty, initialCode } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length < 2) {
    errors.push('Playground title is required and must be at least 2 characters');
  }

  if (!topic && !topicId) {
    errors.push('Topic reference (topic or topicId) is required');
  }

  if (language && !['javascript', 'typescript', 'python'].includes(language.toLowerCase())) {
    errors.push('Language must be one of: javascript, typescript, python');
  }

  if (difficulty && !['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(difficulty.toUpperCase())) {
    errors.push('Difficulty must be one of: BEGINNER, INTERMEDIATE, ADVANCED');
  }

  if (initialCode !== undefined && typeof initialCode !== 'string') {
    errors.push('initialCode must be a string');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

export const validateUpdatePlayground = (req, res, next) => {
  const { title, language, difficulty, initialCode } = req.body;
  const errors = [];

  if (title !== undefined && (typeof title !== 'string' || title.trim().length < 2)) {
    errors.push('Playground title must be at least 2 characters');
  }

  if (language && !['javascript', 'typescript', 'python'].includes(language.toLowerCase())) {
    errors.push('Language must be one of: javascript, typescript, python');
  }

  if (difficulty && !['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(difficulty.toUpperCase())) {
    errors.push('Difficulty must be one of: BEGINNER, INTERMEDIATE, ADVANCED');
  }

  if (initialCode !== undefined && typeof initialCode !== 'string') {
    errors.push('initialCode must be a string');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

export const validateRunCode = (req, res, next) => {
  const { code, language } = req.body;
  const errors = [];

  if (code === undefined || code === null || typeof code !== 'string') {
    errors.push('Code string is required for execution');
  } else if (code.length > 50 * 1024) {
    errors.push('Code exceeds maximum allowed size (50 KB)');
  }

  if (language && language.toLowerCase() !== 'javascript') {
    errors.push('Only JavaScript is currently supported for server execution');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};
