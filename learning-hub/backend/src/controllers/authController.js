import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { generateToken } from '../utils/jwt.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      throw new ApiError('Please provide name, email, and password', 400);
    }

    if (password.length < 6) {
      throw new ApiError('Password must be at least 6 characters long', 400);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ApiError('An account with this email address already exists', 409);
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
    });

    const token = generateToken({ id: user._id, role: user.role });

    return sendSuccess(
      res,
      'User registered successfully',
      {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError('Please provide email and password', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      throw new ApiError('Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError('Invalid email or password', 401);
    }

    const token = generateToken({ id: user._id, role: user.role });

    return sendSuccess(res, 'Login successful', {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, 'User profile retrieved successfully', {
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};
