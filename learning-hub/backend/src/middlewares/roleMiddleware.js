import { ApiError } from '../utils/apiError.js';

/**
 * Authorize specified roles
 * @param  {...string} roles - Permitted user roles ('student', 'instructor', 'admin')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError('Authentication required before role verification', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          `User role '${req.user.role}' is not authorized to access this resource`,
          403
        )
      );
    }

    next();
  };
};

export default authorize;
