import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const getAccessSecret = () =>
  process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'fallback_access_secret_2026';

const getRefreshSecret = () =>
  process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_2026';

/**
 * Generate a short-lived Access Token (default: 15m)
 */
export const generateAccessToken = (payload) => {
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
  return jwt.sign(
    { ...payload, jti: crypto.randomUUID() },
    getAccessSecret(),
    { expiresIn }
  );
};

/**
 * Generate a long-lived Refresh Token (default: 7d)
 */
export const generateRefreshToken = (payload) => {
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  return jwt.sign(
    { ...payload, jti: crypto.randomUUID() },
    getRefreshSecret(),
    { expiresIn }
  );
};

/**
 * Verify an Access Token
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, getAccessSecret());
};

/**
 * Verify a Refresh Token
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, getRefreshSecret());
};

// Aliases for backward compatibility
export const generateToken = generateAccessToken;
export const verifyToken = verifyAccessToken;
