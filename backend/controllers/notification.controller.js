/**
 * Notification Controller
 */

const Notification               = require('../models/Notification.model');
const { sendSuccess, sendError }  = require('../utils/helpers');

// ── GET /api/v1/notifications ─────────────────────────────────────────────────
// Returns: broadcast notifications + notifications targeted to this user
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    const filter = {
      isActive: true,
      $or: [{ user: null }, { user: userId }],
    };

    const total         = await Notification.countDocuments(filter);
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    // Annotate each notification with read status
    const result = notifications.map((n) => ({
      ...n,
      read: n.readBy ? n.readBy.map(String).includes(String(userId)) : false,
    }));

    return sendSuccess(res, { notifications: result, total });
  } catch (err) {
    return sendError(res, 'Failed to fetch notifications.', 500);
  }
};

// ── PATCH /api/v1/notifications/:id/read ─────────────────────────────────────
const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {
      $addToSet: { readBy: req.user._id },
    });
    return sendSuccess(res, null, 'Notification marked as read');
  } catch (err) {
    return sendError(res, 'Failed to mark as read.', 500);
  }
};

// ── PATCH /api/v1/notifications/read-all ─────────────────────────────────────
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.updateMany(
      { $or: [{ user: null }, { user: userId }], readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );
    return sendSuccess(res, null, 'All notifications marked as read');
  } catch (err) {
    return sendError(res, 'Failed to mark all as read.', 500);
  }
};

// ── POST /api/v1/notifications (admin only) ───────────────────────────────────
const createNotification = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    return sendSuccess(res, { notification }, 'Notification created', 201);
  } catch (err) {
    return sendError(res, 'Failed to create notification.', 500);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, createNotification };
