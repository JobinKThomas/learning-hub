import { verifyToken } from '../utils/jwt.js';
import { ApiError } from '../utils/apiError.js';
import { User } from '../models/User.js';

/**
 * Protect routes: verify JWT Bearer token
 */
export const authenticate = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ApiError('Not authorized to access this resource. Missing token.', 401);
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      throw new ApiError('Invalid or expired authentication token.', 401);
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError('The user belonging to this token no longer exists.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-based access control middleware
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ApiError(
          `User role '${req.user?.role}' is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
