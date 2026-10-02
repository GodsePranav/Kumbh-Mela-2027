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

// ── Development-only demo login ───────────────────────────────────────────────
const crypto = require('crypto');
const VolunteerProfile = require('../models/VolunteerProfile.model');
const demoLogin = async (req, res) => {
  if (process.env.NODE_ENV === 'production') return sendError(res, 'Demo login is disabled in production.', 404);
  try {
    const role = ['user', 'volunteer', 'admin'].includes(req.body?.role) ? req.body.role : null;
    if (!role) return sendError(res, 'Choose a valid demo role.', 400);
    const email = role === 'volunteer' ? 'volunteer@kumbhsmart.in' : role === 'admin' ? 'admin@kumbhsmart.in' : 'pilgrim@kumbhsmart.in';
    const name = role === 'volunteer' ? 'Demo Volunteer' : role === 'admin' ? 'Control Room Admin' : 'Demo Pilgrim';
    let user = await User.findOne({ email });
    if (user && user.role !== role) return sendError(res, 'Demo account role mismatch.', 409);
    if (!user) user = await User.create({ name, email, password: crypto.randomBytes(24).toString('hex'), role, isVerified: true });
    if (role === 'volunteer') {
      await VolunteerProfile.updateOne({ user: user._id }, { $setOnInsert: { badgeNumber: `DEMO-${String(user._id).slice(-8)}`, dutyStatus: 'ON_DUTY', emergencyEligibility: true } }, { upsert: true });
    }
    const token = generateToken(user._id);
    return sendSuccess(res, { user, token }, 'Demo session started.');
  } catch (err) {
    console.error('demoLogin error:', err.message);
    return sendError(res, 'Demo login is unavailable. Ensure the database is running.', 503);
  }
};

module.exports = { register, login, getMe, logout, demoLogin };
