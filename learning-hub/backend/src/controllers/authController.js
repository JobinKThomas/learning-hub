import { authService } from '../services/authService.js';
import { sendSuccess } from '../utils/apiResponse.js';

// Cookie configuration for refresh tokens
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class AuthController {
  constructor(service = authService) {
    this.service = service;
  }

  /**
   * @desc    Register a new user
   * @route   POST /api/auth/register
   * @access  Public
   */
  register = async (req, res, next) => {
    try {
      const { name, email, password, role } = req.body;
      const result = await this.service.register({ name, email, password, role });

      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

      return sendSuccess(
        res,
        'User registered successfully',
        result,
        201
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Authenticate user & issue tokens
   * @route   POST /api/auth/login
   * @access  Public
   */
  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await this.service.login({ email, password });

      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

      return sendSuccess(
        res,
        'Login successful',
        result,
        200
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Renew access token using refresh token
   * @route   POST /api/auth/refresh
   * @access  Public
   */
  refresh = async (req, res, next) => {
    try {
      const token = req.refreshToken || req.body?.refreshToken || req.cookies?.refreshToken;
      const result = await this.service.refresh(token);

      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

      return sendSuccess(
        res,
        'Token refreshed successfully',
        result,
        200
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Log out user & revoke refresh token
   * @route   POST /api/auth/logout
   * @access  Public (or authenticated)
   */
  logout = async (req, res, next) => {
    try {
      const token = req.body?.refreshToken || req.cookies?.refreshToken;
      const userId = req.user?._id;

      await this.service.logout({ userId, refreshToken: token });

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      return sendSuccess(
        res,
        'Logged out successfully',
        null,
        200
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Get current authenticated user profile
   * @route   GET /api/auth/me
   * @access  Private
   */
  getMe = async (req, res, next) => {
    try {
      const user = await this.service.getMe(req.user._id);

      return sendSuccess(
        res,
        'User profile retrieved successfully',
        { user },
        200
      );
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();

// Export named handlers for backward compatibility
export const register = authController.register;
export const login = authController.login;
export const refresh = authController.refresh;
export const logout = authController.logout;
export const getMe = authController.getMe;
