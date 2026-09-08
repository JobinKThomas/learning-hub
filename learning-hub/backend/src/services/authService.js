import crypto from 'crypto';
import { authRepository } from '../repositories/authRepository.js';
import { ApiError } from '../utils/apiError.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';

export class AuthService {
  constructor(repository = authRepository) {
    this.repository = repository;
  }

  /**
   * Register a new user
   */
  async register({ name, email, password, role }) {
    const existingUser = await this.repository.findByEmail(email);
    if (existingUser) {
      throw new ApiError('An account with this email address already exists', 409);
    }

    const user = await this.repository.createUser({
      name,
      email,
      password,
      role: role || 'student',
    });

    const payload = { id: user._id.toString(), role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await this.repository.addRefreshToken(user._id, refreshToken);

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Authenticate user & issue tokens
   */
  async login({ email, password }) {
    const user = await this.repository.findByEmail(email, { includePassword: true });
    if (!user) {
      throw new ApiError('Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError('Invalid email or password', 401);
    }

    const payload = { id: user._id.toString(), role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await this.repository.addRefreshToken(user._id, refreshToken);

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Renew access token using a valid refresh token (with rotation)
   */
  async refresh(oldRefreshToken) {
    if (!oldRefreshToken) {
      throw new ApiError('Refresh token is required', 400);
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(oldRefreshToken);
    } catch (err) {
      throw new ApiError('Invalid or expired refresh token', 401);
    }

    const user = await this.repository.findByRefreshToken(oldRefreshToken);
    if (!user || user._id.toString() !== decoded.id) {
      throw new ApiError('Refresh token is invalid or has been revoked', 401);
    }

    // Token rotation: remove old refresh token and issue new pair
    await this.repository.removeRefreshToken(user._id, oldRefreshToken);

    const payload = { id: user._id.toString(), role: user.role };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    await this.repository.addRefreshToken(user._id, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Log user out by invalidating refresh token
   */
  async logout({ userId, refreshToken }) {
    if (refreshToken) {
      // Find the user containing this token and remove it
      const user = await this.repository.findByRefreshToken(refreshToken);
      if (user) {
        await this.repository.removeRefreshToken(user._id, refreshToken);
      }
    } else if (userId) {
      // Clear all tokens for the user
      await this.repository.clearAllRefreshTokens(userId);
    }

    return { message: 'Logged out successfully' };
  }

  /**
   * Fetch current user profile
   */
  async getMe(userId) {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new ApiError('The user belonging to this token no longer exists', 404);
    }
    return user;
  }

  /**
   * Update profile information (e.g. name)
   */
  async updateProfile(userId, { name }) {
    if (!name || !name.trim()) {
      throw new ApiError('Name is required', 400);
    }

    const updatedUser = await this.repository.updateName(userId, name.trim());
    if (!updatedUser) {
      throw new ApiError('User not found', 404);
    }

    return updatedUser;
  }

  /**
   * Update user password with current password verification
   */
  async updatePassword(userId, { currentPassword, newPassword }) {
    const user = await this.repository.findById(userId, { includePassword: true });
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new ApiError('Current password is incorrect', 400);
    }

    user.password = newPassword;
    user.refreshTokens = [];
    await user.save();

    const payload = { id: user._id.toString(), role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await this.repository.addRefreshToken(user._id, refreshToken);

    return {
      message: 'Password updated successfully',
      accessToken,
      refreshToken,
    };
  }

  /**
   * Generate password reset token
   */
  async forgotPassword(email) {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      return {
        message: 'If an account with that email exists, a password reset link has been sent.',
      };
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    return {
      message: 'Password reset link generated successfully',
      resetToken,
      resetUrl,
    };
  }

  /**
   * Reset user password using token
   */
  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.repository.findByResetToken(hashedToken);
    if (!user) {
      throw new ApiError('Password reset token is invalid or has expired', 400);
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.refreshTokens = [];
    await user.save();

    const payload = { id: user._id.toString(), role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await this.repository.addRefreshToken(user._id, refreshToken);

    return {
      message: 'Password reset successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }
}

export const authService = new AuthService();
