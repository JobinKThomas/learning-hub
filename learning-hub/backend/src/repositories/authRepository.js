import { User } from '../models/User.js';

export class AuthRepository {
  /**
   * Create a new user record
   */
  async createUser(userData) {
    return await User.create(userData);
  }

  /**
   * Find a user by email
   */
  async findByEmail(email, { includePassword = false, includeRefreshTokens = false } = {}) {
    let query = User.findOne({ email: email.toLowerCase().trim() });
    const selectFields = [];
    if (includePassword) selectFields.push('+password');
    if (includeRefreshTokens) selectFields.push('+refreshTokens');

    if (selectFields.length > 0) {
      query = query.select(selectFields.join(' '));
    }
    return await query.exec();
  }

  /**
   * Find a user by ID
   */
  async findById(id, { includeRefreshTokens = false } = {}) {
    let query = User.findById(id);
    if (includeRefreshTokens) {
      query = query.select('+refreshTokens');
    }
    return await query.exec();
  }

  /**
   * Append an active refresh token to user's tokens list
   */
  async addRefreshToken(userId, token) {
    return await User.findByIdAndUpdate(
      userId,
      { $push: { refreshTokens: { token, createdAt: new Date() } } },
      { new: true }
    );
  }

  /**
   * Remove a specific refresh token from user's tokens list
   */
  async removeRefreshToken(userId, token) {
    return await User.findByIdAndUpdate(
      userId,
      { $pull: { refreshTokens: { token } } },
      { new: true }
    );
  }

  /**
   * Find a user that contains the given refresh token
   */
  async findByRefreshToken(token) {
    return await User.findOne({ 'refreshTokens.token': token }).select('+refreshTokens');
  }

  /**
   * Invalidate all refresh tokens for a user
   */
  async clearAllRefreshTokens(userId) {
    return await User.findByIdAndUpdate(
      userId,
      { $set: { refreshTokens: [] } },
      { new: true }
    );
  }
}

export const authRepository = new AuthRepository();
