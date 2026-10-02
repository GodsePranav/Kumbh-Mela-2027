/**
 * Lost & Found Controller
 */

const LostFound                  = require('../models/LostFound.model');
const { sendSuccess, sendError }  = require('../utils/helpers');

// ── GET /api/v1/lost-found ────────────────────────────────────────────────────
const getAll = async (req, res) => {
  try {
    const { type, category, status = 'open', page = 1, limit = 20 } = req.query;
    const filter = {};

    if (type)     filter.type     = type;
    if (category) filter.category = category;
    if (status)   filter.status   = status;

    const total  = await LostFound.countDocuments(filter);
    const items  = await LostFound.find(filter)
      .populate('reportedBy', 'name mobile')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return sendSuccess(res, { items, total });
  } catch (err) {
    return sendError(res, 'Failed to fetch lost & found items.', 500);
  }
};

// ── POST /api/v1/lost-found ───────────────────────────────────────────────────
const createReport = async (req, res) => {
  try {
    const item = await LostFound.create({ ...req.body, reportedBy: req.user._id });
    return sendSuccess(res, { item }, 'Report submitted successfully', 201);
  } catch (err) {
    return sendError(res, 'Failed to submit report.', 500);
  }
};

// ── GET /api/v1/lost-found/my-reports ────────────────────────────────────────
const getMyReports = async (req, res) => {
  try {
    const items = await LostFound.find({ reportedBy: req.user._id }).sort({ createdAt: -1 });
    return sendSuccess(res, { items });
  } catch (err) {
    return sendError(res, 'Failed to fetch your reports.', 500);
  }
};

// ── PATCH /api/v1/lost-found/:id/resolve ─────────────────────────────────────
const resolveReport = async (req, res) => {
  try {
    const item = await LostFound.findOneAndUpdate(
      { _id: req.params.id, reportedBy: req.user._id },
      { status: 'resolved', resolvedAt: new Date() },
      { new: true }
    );
    if (!item) return sendError(res, 'Report not found.', 404);
    return sendSuccess(res, { item }, 'Report marked as resolved');
  } catch (err) {
    return sendError(res, 'Failed to resolve report.', 500);
  }
};

// ── DELETE /api/v1/lost-found/:id ─────────────────────────────────────────────
const deleteReport = async (req, res) => {
  try {
    const item = await LostFound.findOneAndDelete({ _id: req.params.id, reportedBy: req.user._id });
    if (!item) return sendError(res, 'Report not found.', 404);
    return sendSuccess(res, null, 'Report deleted');
  } catch (err) {
    return sendError(res, 'Failed to delete report.', 500);
  }
};

module.exports = { getAll, createReport, getMyReports, resolveReport, deleteReport };
