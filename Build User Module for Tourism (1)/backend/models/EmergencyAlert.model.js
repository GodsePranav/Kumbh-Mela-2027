/**
 * EmergencyAlert Model
 * SOS alerts raised by pilgrims
 */

const mongoose = require('mongoose');

const emergencyAlertSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['sos', 'medical', 'fire', 'missing_person', 'crowd_crush', 'other'],
      default: 'sos',
    },
    message:   { type: String },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: [Number],      // [lng, lat]
    },
    locationText: { type: String },   // human-readable description
    status: {
      type: String,
      enum: ['active', 'acknowledged', 'resolved'],
      default: 'active',
    },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt:  { type: Date },
  },
  { timestamps: true }
);

emergencyAlertSchema.index({ location: '2dsphere' });
emergencyAlertSchema.index({ user: 1 });
emergencyAlertSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('EmergencyAlert', emergencyAlertSchema);
