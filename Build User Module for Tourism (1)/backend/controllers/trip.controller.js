/**
 * Trip Controller
 * User itinerary / trip plan CRUD
 */

const Trip                       = require('../models/Trip.model');
const { sendSuccess, sendError }  = require('../utils/helpers');

// ── GET /api/v1/trips ─────────────────────────────────────────────────────────
const getMyTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user._id }).sort({ createdAt: -1 });
    return sendSuccess(res, { trips });
  } catch (err) {
    return sendError(res, 'Failed to fetch trips.', 500);
  }
};

// ── GET /api/v1/trips/:id ─────────────────────────────────────────────────────
const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
    if (!trip) return sendError(res, 'Trip not found.', 404);
    return sendSuccess(res, { trip });
  } catch (err) {
    return sendError(res, 'Failed to fetch trip.', 500);
  }
};

// ── POST /api/v1/trips ────────────────────────────────────────────────────────
const createTrip = async (req, res) => {
  try {
    const trip = await Trip.create({ ...req.body, user: req.user._id });
    return sendSuccess(res, { trip }, 'Trip created successfully', 201);
  } catch (err) {
    return sendError(res, 'Failed to create trip.', 500);
  }
};

// ── PUT /api/v1/trips/:id ─────────────────────────────────────────────────────
const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!trip) return sendError(res, 'Trip not found.', 404);
    return sendSuccess(res, { trip }, 'Trip updated');
  } catch (err) {
    return sendError(res, 'Failed to update trip.', 500);
  }
};

// ── DELETE /api/v1/trips/:id ──────────────────────────────────────────────────
const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!trip) return sendError(res, 'Trip not found.', 404);
    return sendSuccess(res, null, 'Trip deleted');
  } catch (err) {
    return sendError(res, 'Failed to delete trip.', 500);
  }
};

module.exports = { getMyTrips, getTripById, createTrip, updateTrip, deleteTrip };
