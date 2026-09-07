import { sendError } from '../utils/apiResponse.js';

export const validateProgressUpdate = (req, res, next) => {
  const { topicId, topic, keyPointIndex, completed, isCompleted } = req.body;

  if (!topicId && !topic) {
    return sendError(
      res,
      'Validation Error',
      ['topicId or topic is required'],
      400
    );
  }

  if (keyPointIndex !== undefined && keyPointIndex !== null) {
    const idx = Number(keyPointIndex);
    if (isNaN(idx) || idx < 0 || !Number.isInteger(idx)) {
      return sendError(
        res,
        'Validation Error',
        ['keyPointIndex must be a non-negative integer'],
        400
      );
    }
  }

  if (completed !== undefined && typeof completed !== 'boolean') {
    return sendError(
      res,
      'Validation Error',
      ['completed must be a boolean value'],
      400
    );
  }

  if (isCompleted !== undefined && typeof isCompleted !== 'boolean') {
    return sendError(
      res,
      'Validation Error',
      ['isCompleted must be a boolean value'],
      400
    );
  }

  next();
};

export default {
  validateProgressUpdate,
};
