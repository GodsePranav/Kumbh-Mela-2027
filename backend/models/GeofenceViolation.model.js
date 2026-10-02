/**
 * GeofenceViolation Model
 * Track volunteer boundary exit and return events with grace period validation.
 */

const mongoose = require('mongoose');

const geofenceViolationSchema = new mongoose.Schema(
  {
    violationId: { type: String, required: true, unique: true },
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    volunteerName: { type: String, required: true },
    badgeNumber: { type: String },
    assignedZoneId: { type: String, required: true },
    assignedZoneName: { type: String, required: true },
    violationType: {
      type: String,
      enum: ['ZONE_EXIT', 'ZONE_RETURN'],
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    distanceOutsideMeters: { type: Number, default: 0 },
    consecutiveReadings: { type: Number, default: 1 },
    gracePeriodMs: { type: Number, default: 30000 },
    status: {
      type: String,
      enum: ['PENDING_VERIFICATION', 'VERIFIED_VIOLATION', 'ACKNOWLEDGED', 'RESOLVED_RETURNED'],
      default: 'PENDING_VERIFICATION',
    },
    notes: { type: String },
    supervisorAlerted: { type: Boolean, default: false },
    adminAlerted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

geofenceViolationSchema.index({ location: '2dsphere' });
geofenceViolationSchema.index({ volunteer: 1, createdAt: -1 });

module.exports = mongoose.model('GeofenceViolation', geofenceViolationSchema);
