/**
 * Place Controller
 * CRUD and search for tourist/religious locations
 */

const Place                      = require('../models/Place.model');
const { sendSuccess, sendError }  = require('../utils/helpers');

// ── GET /api/v1/places ────────────────────────────────────────────────────────
const getAllPlaces = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const total = await Place.countDocuments(filter);
    const places = await Place.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ rating: -1 });

    return sendSuccess(res, { places, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    return sendError(res, 'Failed to fetch places.', 500);
  }
};

// ── GET /api/v1/places/nearby ─────────────────────────────────────────────────
const getNearbyPlaces = async (req, res) => {
  try {
    const { lng, lat, maxDistance = 5000 } = req.query;  // maxDistance in metres
    if (!lng || !lat) return sendError(res, 'lng and lat are required.', 400);

    const places = await Place.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(maxDistance),
        },
      },
      isActive: true,
    }).limit(20);

    return sendSuccess(res, { places });
  } catch (err) {
    return sendError(res, 'Failed to fetch nearby places.', 500);
  }
};

// ── GET /api/v1/places/:id ────────────────────────────────────────────────────
const getPlaceById = async (req, res) => {
  try {
    const place = await Place.findOne({ placeId: req.params.id, isActive: true });
    if (!place) return sendError(res, 'Place not found.', 404);
    return sendSuccess(res, { place });
  } catch (err) {
    return sendError(res, 'Failed to fetch place.', 500);
  }
};

// ── POST /api/v1/places ───────────────────────────────────────────────────────
const createPlace = async (req, res) => {
  try {
    const { lat, lng, ...rest } = req.body;
    const place = await Place.create({
      ...rest,
      location: { type: 'Point', coordinates: [lng, lat] },
    });
    return sendSuccess(res, { place }, 'Place created successfully', 201);
  } catch (err) {
    console.error(err);
    return sendError(res, 'Failed to create place.', 500);
  }
};

// ── PUT /api/v1/places/:id ────────────────────────────────────────────────────
const updatePlace = async (req, res) => {
  try {
    const { lat, lng, ...rest } = req.body;
    const updates = { ...rest };
    if (lat && lng) updates.location = { type: 'Point', coordinates: [lng, lat] };

    const place = await Place.findOneAndUpdate({ placeId: req.params.id }, updates, { new: true });
    if (!place) return sendError(res, 'Place not found.', 404);
    return sendSuccess(res, { place }, 'Place updated');
  } catch (err) {
    return sendError(res, 'Failed to update place.', 500);
  }
};

// ── DELETE /api/v1/places/:id ─────────────────────────────────────────────────
const deletePlace = async (req, res) => {
  try {
    const place = await Place.findOneAndUpdate(
      { placeId: req.params.id },
      { isActive: false },
      { new: true }
    );
    if (!place) return sendError(res, 'Place not found.', 404);
    return sendSuccess(res, null, 'Place deactivated');
  } catch (err) {
    return sendError(res, 'Failed to delete place.', 500);
  }
};

module.exports = { getAllPlaces, getNearbyPlaces, getPlaceById, createPlace, updatePlace, deletePlace };
