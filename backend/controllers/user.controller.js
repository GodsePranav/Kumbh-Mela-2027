/**
 * User Controller
 * Profile management, saved places, schedule, preferences
 */

const User                      = require('../models/User.model');
const { sendSuccess, sendError } = require('../utils/helpers');
const { validationResult }      = require('express-validator');

// ── GET /api/v1/users/profile ─────────────────────────────────────────────────
const getProfile = async (req, res) => {
  return sendSuccess(res, { user: req.user });
};

// ── PUT /api/v1/users/profile ─────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg, 422);

  try {
    const allowedFields = ['name', 'mobile', 'language', 'hometown', 'emergencyContact', 'avatar'];
    const updates = {};
    allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true, runValidators: true,
    });
    return sendSuccess(res, { user }, 'Profile updated successfully');
  } catch (err) {
    console.error('updateProfile error:', err);
    return sendError(res, 'Failed to update profile.', 500);
  }
};

// ── PUT /api/v1/users/password ────────────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return sendError(res, 'Both currentPassword and newPassword are required.', 400);
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return sendError(res, 'Current password is incorrect.', 400);

    user.password = newPassword;
    await user.save();
    return sendSuccess(res, null, 'Password changed successfully');
  } catch (err) {
    return sendError(res, 'Failed to change password.', 500);
  }
};

// ── POST /api/v1/users/saved-places/:placeId ─────────────────────────────────
const savePlace = async (req, res) => {
  try {
    const { placeId } = req.params;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { savedPlaces: placeId } },
      { new: true }
    );
    return sendSuccess(res, { savedPlaces: user.savedPlaces }, 'Place saved');
  } catch (err) {
    return sendError(res, 'Failed to save place.', 500);
  }
};

// ── DELETE /api/v1/users/saved-places/:placeId ───────────────────────────────
const unsavePlace = async (req, res) => {
  try {
    const { placeId } = req.params;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { savedPlaces: placeId } },
      { new: true }
    );
    return sendSuccess(res, { savedPlaces: user.savedPlaces }, 'Place removed from saved');
  } catch (err) {
    return sendError(res, 'Failed to remove saved place.', 500);
  }
};

// ── GET /api/v1/users/saved-places ───────────────────────────────────────────
const getSavedPlaces = async (req, res) => {
  return sendSuccess(res, { savedPlaces: req.user.savedPlaces });
};

// ── POST /api/v1/users/schedule/:eventId ─────────────────────────────────────
const addToSchedule = async (req, res) => {
  try {
    const { eventId } = req.params;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { mySchedule: eventId } },
      { new: true }
    );
    return sendSuccess(res, { mySchedule: user.mySchedule }, 'Event added to schedule');
  } catch (err) {
    return sendError(res, 'Failed to add event.', 500);
  }
};

// ── DELETE /api/v1/users/schedule/:eventId ───────────────────────────────────
const removeFromSchedule = async (req, res) => {
  try {
    const { eventId } = req.params;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { mySchedule: eventId } },
      { new: true }
    );
    return sendSuccess(res, { mySchedule: user.mySchedule }, 'Event removed from schedule');
  } catch (err) {
    return sendError(res, 'Failed to remove event.', 500);
  }
};

// ── DELETE /api/v1/users/account ─────────────────────────────────────────────
const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    return sendSuccess(res, null, 'Account deactivated successfully');
  } catch (err) {
    return sendError(res, 'Failed to delete account.', 500);
  }
};

module.exports = {
  getProfile, updateProfile, changePassword,
  savePlace, unsavePlace, getSavedPlaces,
  addToSchedule, removeFromSchedule, deleteAccount,
};
