/**
 * Notification Model
 * Push/in-app notifications for pilgrims
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // null = broadcast to all users; ObjectId = targeted notification
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    type: {
      type: String,
      enum: ['emergency', 'event', 'route', 'announcement', 'info'],
      required: true,
    },
    title:   { type: String, required: true, trim: true },
    message: { type: String, required: true },

    // Track per-user read status for broadcasts
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
