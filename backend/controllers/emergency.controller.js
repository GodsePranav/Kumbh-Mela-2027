/**
 * Emergency Controller
 * SOS alerts, emergency contacts, nearby hospitals & police
 */

const EmergencyAlert             = require('../models/EmergencyAlert.model');
const { sendSuccess, sendError }  = require('../utils/helpers');

// ── POST /api/v1/emergency/sos ────────────────────────────────────────────────
const createSOS = async (req, res) => {
  try {
    const { type = 'sos', message, lat, lng, locationText } = req.body;

    const alert = await EmergencyAlert.create({
      user: req.user._id,
      type,
      message,
      locationText,
      ...(lat && lng && {
        location: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
      }),
    });

    console.log(`🚨 SOS from user ${req.user._id} at ${locationText || 'unknown'}`);
    return sendSuccess(res, { alert }, 'SOS alert raised. Help is on the way!', 201);
  } catch (err) {
    return sendError(res, 'Failed to raise SOS.', 500);
  }
};

// ── GET /api/v1/emergency/my-alerts ──────────────────────────────────────────
const getMyAlerts = async (req, res) => {
  try {
    const alerts = await EmergencyAlert.find({ user: req.user._id }).sort({ createdAt: -1 });
    return sendSuccess(res, { alerts });
  } catch (err) {
    return sendError(res, 'Failed to fetch alerts.', 500);
  }
};

// ── GET /api/v1/emergency/contacts ───────────────────────────────────────────
// Static emergency contacts (hospitals, police, helpline)
const getEmergencyContacts = async (_req, res) => {
  const contacts = {
    helplines: [
      { name: 'Kumbh Mela Control Room', number: '1800-233-2027', available: '24/7' },
      { name: 'Police (Emergency)',       number: '100',           available: '24/7' },
      { name: 'Ambulance',               number: '108',           available: '24/7' },
      { name: 'Fire Brigade',            number: '101',           available: '24/7' },
      { name: 'Women Helpline',          number: '1091',          available: '24/7' },
    ],
    hospitals: [
      { name: 'Nashik Civil Hospital',              contact: '0253-2577555', distance: '2.1 km' },
      { name: 'Kumbh Medical Camp – Zone A',        contact: '1800-XXX-XXXX', distance: '0.2 km' },
      { name: 'Kumbh Medical Camp – Zone B',        contact: '1800-XXX-XXXX', distance: '0.6 km' },
      { name: 'Dr. Vasantrao Pawar Medical College', contact: '0253-2512777', distance: '4.3 km' },
    ],
    policeStations: [
      { name: 'Nashik Kumbh Mela Police HQ', contact: '0253-2311000', distance: '0.4 km' },
      { name: 'Panchavati Police Station',   contact: '0253-2313000', distance: '1.1 km' },
      { name: 'Ramkund Watch Post',          contact: '100',           distance: '0.1 km' },
    ],
  };
  return sendSuccess(res, contacts);
};

// ── PATCH /api/v1/emergency/:id/resolve (admin/volunteer only) ────────────────
const resolveAlert = async (req, res) => {
  try {
    const alert = await EmergencyAlert.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved', respondedBy: req.user._id, resolvedAt: new Date() },
      { new: true }
    );
    if (!alert) return sendError(res, 'Alert not found.', 404);
    return sendSuccess(res, { alert }, 'Alert resolved');
  } catch (err) {
    return sendError(res, 'Failed to resolve alert.', 500);
  }
};

module.exports = { createSOS, getMyAlerts, getEmergencyContacts, resolveAlert };
