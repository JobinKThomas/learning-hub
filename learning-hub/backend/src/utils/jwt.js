import jwt from 'jsonwebtoken';

/**
 * Generate a signed JWT
 * @param {Object} payload - Data to embed in the token
 * @param {string} [expiresIn] - Optional expiration string (defaults to env or '7d')
 * @returns {string} Signed JWT
 */
export const generateToken = (payload, expiresIn = process.env.JWT_EXPIRES_IN || '7d') => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_change_in_production';
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify a JWT
 * @param {string} token - The token to verify
 * @returns {Object} Decoded payload
 */
export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_change_in_production';
  return jwt.verify(token, secret);
};
