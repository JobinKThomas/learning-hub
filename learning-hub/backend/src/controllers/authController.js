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

  /**
   * @desc    Update current authenticated user profile
   * @route   PUT /api/auth/profile
   * @access  Private
   */
  updateProfile = async (req, res, next) => {
    try {
      const { name } = req.body;
      const user = await this.service.updateProfile(req.user._id, { name });

      return sendSuccess(
        res,
        'Profile updated successfully',
        { user },
        200
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Update current authenticated user password
   * @route   PUT /api/auth/update-password
   * @access  Private
   */
  updatePassword = async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await this.service.updatePassword(req.user._id, {
        currentPassword,
        newPassword,
      });

      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

      return sendSuccess(
        res,
        result.message || 'Password updated successfully',
        result,
        200
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Request password reset token
   * @route   POST /api/auth/forgot-password
   * @access  Public
   */
  forgotPassword = async (req, res, next) => {
    try {
      const { email } = req.body;
      const result = await this.service.forgotPassword(email);

      return sendSuccess(
        res,
        result.message,
        result,
        200
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Reset password using token
   * @route   POST /api/auth/reset-password/:token
   * @access  Public
   */
  resetPassword = async (req, res, next) => {
    try {
      const { token } = req.params;
      const { password } = req.body;
      const result = await this.service.resetPassword(token, password);

      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

      return sendSuccess(
        res,
        result.message || 'Password reset successfully',
        result,
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
export const updateProfile = authController.updateProfile;
export const updatePassword = authController.updatePassword;
export const forgotPassword = authController.forgotPassword;
export const resetPassword = authController.resetPassword;
