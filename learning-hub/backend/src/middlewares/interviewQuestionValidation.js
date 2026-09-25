export const validateCreateInterviewQuestion = (req, res, next) => {
  const { topic, question, answer, difficulty, frequency } = req.body;
  const errors = [];

  if (!topic || typeof topic !== 'string' || !topic.trim()) {
    errors.push('topic is required');
  }

  if (!question || typeof question !== 'string' || question.trim().length < 5) {
    errors.push('question prompt is required and must be at least 5 characters');
  }

  if (!answer || typeof answer !== 'string' || !answer.trim()) {
    errors.push('answer is required');
  }

  if (difficulty && !['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(difficulty.toUpperCase())) {
    errors.push('difficulty must be one of: BEGINNER, INTERMEDIATE, ADVANCED');
  }

  if (frequency && !['FREQUENT', 'COMMON', 'RARE'].includes(frequency.toUpperCase())) {
    errors.push('frequency must be one of: FREQUENT, COMMON, RARE');
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

export const validateUpdateInterviewQuestion = (req, res, next) => {
  const { question, answer, difficulty, frequency } = req.body;
  const errors = [];

  if (question !== undefined && (typeof question !== 'string' || question.trim().length < 5)) {
    errors.push('question prompt must be at least 5 characters');
  }

  if (answer !== undefined && (typeof answer !== 'string' || !answer.trim())) {
    errors.push('answer cannot be empty');
  }

  if (difficulty && !['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(difficulty.toUpperCase())) {
    errors.push('difficulty must be one of: BEGINNER, INTERMEDIATE, ADVANCED');
  }

  if (frequency && !['FREQUENT', 'COMMON', 'RARE'].includes(frequency.toUpperCase())) {
    errors.push('frequency must be one of: FREQUENT, COMMON, RARE');
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
