const mongoose = require('mongoose');
const pointSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], required: true },
  coordinates: { type: [Number], required: true, validate: { validator: (coordinates) => coordinates.length === 2 && coordinates.every(Number.isFinite), message: 'A valid GPS point is required.' } },
}, { _id: false });

const volunteerProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  badgeNumber: { type: String, required: true, unique: true },
  skills: [{ type: String, enum: ['medical', 'first_aid', 'crowd_control', 'fire_safety', 'translator', 'logistics', 'search_rescue', 'general'], default: 'general' }],
  dutyStatus: { type: String, enum: ['OFF_DUTY', 'ON_DUTY', 'RESPONDING', 'BREAK'], default: 'OFF_DUTY' },
  assignedZone: { type: String, default: 'Zone A - Ram Ghat' },
  location: { type: pointSchema, default: undefined },
  lastLocationUpdate: { type: Date },
  locationAccuracy: { type: Number },
  speed: { type: Number, default: 0 },
  batteryLevel: { type: Number },
  currentWorkload: { type: Number, default: 0 },
  rating: { type: Number, default: 5 },
  emergencyEligibility: { type: Boolean, default: true },
  supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  phone: { type: String },
  deviceToken: { type: String },
}, { timestamps: true });

volunteerProfileSchema.index({ location: '2dsphere' });
volunteerProfileSchema.index({ dutyStatus: 1, emergencyEligibility: 1, lastLocationUpdate: -1 });
volunteerProfileSchema.index({ assignedZone: 1 });

module.exports = mongoose.model('VolunteerProfile', volunteerProfileSchema);
