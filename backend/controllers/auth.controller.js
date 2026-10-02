/**
 * Auth Controller
 * Handles register, login, logout, and token refresh
 */

const User                        = require('../models/User.model');
const { generateToken, sendSuccess, sendError } = require('../utils/helpers');
const { validationResult }        = require('express-validator');

// ── POST /api/v1/auth/register ────────────────────────────────────────────────
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg, 422);

  try {
    const { name, email, password, mobile, language, hometown, emergencyContact } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return sendError(res, 'Email is already registered.', 409);

    const user = await User.create({
      name, email, password, mobile, language, hometown, emergencyContact,
    });

    const token = generateToken(user._id);
    return sendSuccess(res, { user, token }, 'Registration successful!', 201);
  } catch (err) {
    console.error('register error:', err);
    return sendError(res, 'Registration failed. Please try again.', 500);
  }
};

// ── POST /api/v1/auth/login ───────────────────────────────────────────────────
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg, 422);

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) return sendError(res, 'Invalid email or password.', 401);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return sendError(res, 'Invalid email or password.', 401);

    if (!user.isActive) return sendError(res, 'Your account has been deactivated.', 403);

    const token = generateToken(user._id);
    // Remove password from user object before sending
    user.password = undefined;
    return sendSuccess(res, { user, token }, 'Login successful!');
  } catch (err) {
    console.error('login error:', err);
    return sendError(res, 'Login failed. Please try again.', 500);
  }
};

// ── GET /api/v1/auth/me ───────────────────────────────────────────────────────
const getMe = async (req, res) => {
  return sendSuccess(res, { user: req.user }, 'User fetched successfully');
};

// ── POST /api/v1/auth/logout ──────────────────────────────────────────────────
const logout = (req, res) => {
  // JWT is stateless; client must delete the token
  return sendSuccess(res, null, 'Logged out successfully');
};

// ── POST /api/v1/auth/quick-login ──────────────────────────────────────────────
const LoginUser = require('../models/LoginUser.model');

const quickLogin = async (req, res) => {
  try {
    const { name, emailOrMobile, password } = req.body;
    if (!name || !emailOrMobile || !password) {
      return sendError(res, 'Name, Email/Mobile, and Password are required.', 400);
    }
    
    // Create or update the login user in the separate schema
    let loginUser = await LoginUser.findOne({ emailOrMobile });
    if (loginUser) {
      loginUser.name = name;
      loginUser.password = password; // In a real app we'd hash this
      loginUser.lastLogin = Date.now();
      await loginUser.save();
    } else {
      loginUser = await LoginUser.create({ name, emailOrMobile, password });
    }

    return sendSuccess(res, { user: { name: loginUser.name, email: loginUser.emailOrMobile } }, 'Logged in successfully!');
  } catch (err) {
    console.error('quickLogin error:', err);
    return sendError(res, 'Login failed. Please try again.', 500);
  }
};

module.exports = { register, login, getMe, logout, quickLogin };
