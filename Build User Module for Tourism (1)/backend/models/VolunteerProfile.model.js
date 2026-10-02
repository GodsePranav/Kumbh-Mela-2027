/**
 * VolunteerProfile Model
 * Extended profile for registered volunteers, including skills, status, assigned zone, and live location.
 */

const mongoose = require('mongoose');

const volunteerProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    badgeNumber: { type: String, required: true, unique: true },
    skills: [{
      type: String,
      enum: ['medical', 'first_aid', 'crowd_control', 'fire_safety', 'translator', 'logistics', 'search_rescue', 'general'],
      default: 'general',
    }],
    dutyStatus: {
      type: String,
      enum: ['OFF_DUTY', 'ON_DUTY', 'RESPONDING', 'BREAK'],
      default: 'OFF_DUTY',
    },
    assignedZone: { type: String, default: 'Zone A - Ram Ghat' },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: { type: [Number], default: [73.7898, 19.9975] }, // [lng, lat]
    },
    lastLocationUpdate: { type: Date, default: Date.now },
    locationAccuracy: { type: Number, default: 5 }, // meters
    speed: { type: Number, default: 0 }, // m/s
    batteryLevel: { type: Number, default: 100 },
    currentWorkload: { type: Number, default: 0 },
    rating: { type: Number, default: 5.0 },
    emergencyEligibility: { type: Boolean, default: true },
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    phone: { type: String },
    deviceToken: { type: String },
  },
  { timestamps: true }
);

volunteerProfileSchema.index({ location: '2dsphere' });
volunteerProfileSchema.index({ dutyStatus: 1, emergencyEligibility: 1 });
volunteerProfileSchema.index({ assignedZone: 1 });

module.exports = mongoose.model('VolunteerProfile', volunteerProfileSchema);
