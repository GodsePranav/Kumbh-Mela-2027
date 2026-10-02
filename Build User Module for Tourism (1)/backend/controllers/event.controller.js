/**
 * Event Controller
 * Kumbh Mela events – bathing dates, cultural shows, exhibitions
 */

const Event                      = require('../models/Event.model');
const { sendSuccess, sendError }  = require('../utils/helpers');

// ── GET /api/v1/events ────────────────────────────────────────────────────────
const getAllEvents = async (req, res) => {
  try {
    const { type, important, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };

    if (type) filter.type = type;
    if (important !== undefined) filter.important = important === 'true';

    const total  = await Event.countDocuments(filter);
    const events = await Event.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ important: -1, createdAt: 1 });

    return sendSuccess(res, { events, total });
  } catch (err) {
    return sendError(res, 'Failed to fetch events.', 500);
  }
};

// ── GET /api/v1/events/:id ────────────────────────────────────────────────────
const getEventById = async (req, res) => {
  try {
    const event = await Event.findOne({ eventId: req.params.id, isActive: true });
    if (!event) return sendError(res, 'Event not found.', 404);
    return sendSuccess(res, { event });
  } catch (err) {
    return sendError(res, 'Failed to fetch event.', 500);
  }
};

// ── POST /api/v1/events ───────────────────────────────────────────────────────
const createEvent = async (req, res) => {
  try {
    const event = await Event.create(req.body);
    return sendSuccess(res, { event }, 'Event created', 201);
  } catch (err) {
    return sendError(res, 'Failed to create event.', 500);
  }
};

// ── PUT /api/v1/events/:id ────────────────────────────────────────────────────
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate({ eventId: req.params.id }, req.body, { new: true });
    if (!event) return sendError(res, 'Event not found.', 404);
    return sendSuccess(res, { event }, 'Event updated');
  } catch (err) {
    return sendError(res, 'Failed to update event.', 500);
  }
};

// ── DELETE /api/v1/events/:id ─────────────────────────────────────────────────
const deleteEvent = async (req, res) => {
  try {
    await Event.findOneAndUpdate({ eventId: req.params.id }, { isActive: false });
    return sendSuccess(res, null, 'Event deactivated');
  } catch (err) {
    return sendError(res, 'Failed to delete event.', 500);
  }
};

module.exports = { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent };
