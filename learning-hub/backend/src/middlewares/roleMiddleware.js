import { ApiError } from '../utils/apiError.js';

/**
 * Authorize specified roles (case-insensitive)
 * @param  {...string} roles - Permitted user roles ('USER', 'ADMIN', etc.)
 */
export const authorize = (...roles) => {
  const normalizedAllowed = roles.map((r) => r.toUpperCase());

  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError('Authentication required before role verification', 401));
    }

    const userRole = (req.user.role || '').toUpperCase();
    if (!normalizedAllowed.includes(userRole)) {
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

/**
 * Specifically require ADMIN role
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError('Authentication required before role verification', 401));
  }

  const userRole = (req.user.role || '').toUpperCase();
  if (userRole !== 'ADMIN') {
    return next(
      new ApiError(
        `Access denied: Admin privileges required. Current role: '${req.user.role}'`,
        403
      )
    );
  }

  next();
};

export default authorize;
