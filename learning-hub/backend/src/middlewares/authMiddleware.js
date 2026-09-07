import { verifyAccessToken } from '../utils/jwt.js';
import { ApiError } from '../utils/apiError.js';
import { authRepository } from '../repositories/authRepository.js';

/**
 * Protect routes: verify JWT Bearer access token
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
      decoded = verifyAccessToken(token);
    } catch (err) {
      throw new ApiError('Invalid or expired access token.', 401);
    }

    const user = await authRepository.findById(decoded.id);
    if (!user) {
      throw new ApiError('The user belonging to this token no longer exists.', 401);
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    next(error);
  }
};

// Re-export authorize for convenience
export { authorize } from './roleMiddleware.js';
