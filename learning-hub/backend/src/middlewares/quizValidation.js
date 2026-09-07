export const validateCreateQuiz = (req, res, next) => {
  const { title, topic, topicId, questions, passingScore } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length < 2) {
    errors.push('Quiz title is required and must be at least 2 characters');
  }

  if (!topic && !topicId) {
    errors.push('Topic reference (topic or topicId) is required');
  }

  if (passingScore !== undefined && (isNaN(passingScore) || passingScore < 0 || passingScore > 100)) {
    errors.push('passingScore must be a number between 0 and 100');
  }

  if (questions !== undefined) {
    if (!Array.isArray(questions)) {
      errors.push('questions must be an array');
    } else {
      questions.forEach((q, idx) => {
        if (!q.question || typeof q.question !== 'string' || q.question.trim().length < 2) {
          errors.push(`Question #${idx + 1}: question text is required`);
        }
        if (!Array.isArray(q.options) || q.options.length < 2) {
          errors.push(`Question #${idx + 1}: options array must contain at least 2 choices`);
        }
        if (
          q.correctAnswer === undefined ||
          isNaN(q.correctAnswer) ||
          q.correctAnswer < 0 ||
          (Array.isArray(q.options) && q.correctAnswer >= q.options.length)
        ) {
          errors.push(`Question #${idx + 1}: correctAnswer must be a valid option index (0 to ${q.options ? q.options.length - 1 : 0})`);
        }
      });
    }
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

export const validateUpdateQuiz = (req, res, next) => {
  const { title, questions, passingScore } = req.body;
  const errors = [];

  if (title !== undefined && (typeof title !== 'string' || title.trim().length < 2)) {
    errors.push('Quiz title must be at least 2 characters');
  }

  if (passingScore !== undefined && (isNaN(passingScore) || passingScore < 0 || passingScore > 100)) {
    errors.push('passingScore must be a number between 0 and 100');
  }

  if (questions !== undefined) {
    if (!Array.isArray(questions)) {
      errors.push('questions must be an array');
    } else {
      questions.forEach((q, idx) => {
        if (!q.question || typeof q.question !== 'string' || q.question.trim().length < 2) {
          errors.push(`Question #${idx + 1}: question text is required`);
        }
        if (!Array.isArray(q.options) || q.options.length < 2) {
          errors.push(`Question #${idx + 1}: options array must contain at least 2 choices`);
        }
        if (
          q.correctAnswer === undefined ||
          isNaN(q.correctAnswer) ||
          q.correctAnswer < 0 ||
          (Array.isArray(q.options) && q.correctAnswer >= q.options.length)
        ) {
          errors.push(`Question #${idx + 1}: correctAnswer must be a valid option index (0 to ${q.options ? q.options.length - 1 : 0})`);
        }
      });
    }
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

export const validateSubmitQuiz = (req, res, next) => {
  const { answers } = req.body;

  if (!answers || (typeof answers !== 'object' && !Array.isArray(answers))) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: ['Answers payload is required as an object map or array'],
    });
  }

  next();
};
