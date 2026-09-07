/**
 * Standardized API response format
 */
export const sendSuccess = (res, message = 'Success', data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (res, message = 'An error occurred', errors = null, statusCode = 500, stack = null) => {
  const response = {
    success: false,
    message,
    errors: errors || undefined,
  };

  if (process.env.NODE_ENV === 'development' && stack) {
    response.stack = stack;
  }

  return res.status(statusCode).json(response);
};
