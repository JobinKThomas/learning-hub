export const validateCreateAttempt = (req, res, next) => {
  const { answers, timeSpentSeconds } = req.body;

  if (answers === undefined || answers === null) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed: answers object or array is required',
      errors: ['answers is required'],
    });
  }

  if (typeof answers !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed: answers must be an object map or array',
      errors: ['answers must be an object or array'],
    });
  }

  if (timeSpentSeconds !== undefined && timeSpentSeconds !== null) {
    const timeNum = Number(timeSpentSeconds);
    if (isNaN(timeNum) || timeNum < 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: timeSpentSeconds must be a non-negative number',
        errors: ['timeSpentSeconds must be >= 0'],
      });
    }
  }

  next();
};
