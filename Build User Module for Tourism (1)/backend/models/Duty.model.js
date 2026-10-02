/**
 * Duty & Attendance Models
 */

const mongoose = require('mongoose');

const dutySchema = new mongoose.Schema(
  {
    dutyId: { type: String, required: true, unique: true },
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    zoneId: { type: String, required: true },
    zoneName: { type: String, required: true },
    shiftName: { type: String, required: true }, // Morning, Evening, Night
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    reportingLocation: { type: String, required: true },
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    instructions: { type: String },
    status: {
      type: String,
      enum: ['SCHEDULED', 'ACTIVE', 'COMPLETED', 'SWAPPED', 'CANCELLED'],
      default: 'SCHEDULED',
    },
  },
  { timestamps: true }
);

const attendanceSchema = new mongoose.Schema(
  {
    attendanceId: { type: String, required: true, unique: true },
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    duty: { type: mongoose.Schema.Types.ObjectId, ref: 'Duty' },
    checkInTime: { type: Date, required: true },
    checkOutTime: { type: Date },
    checkInLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number],
    },
    checkOutLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number],
    },
    verificationType: {
      type: String,
      enum: ['GPS', 'QR', 'SUPERVISOR'],
      default: 'GPS',
    },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE', 'ON_LEAVE'],
      default: 'PRESENT',
    },
    supervisorVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

dutySchema.index({ volunteer: 1, startTime: 1 });
attendanceSchema.index({ volunteer: 1, createdAt: -1 });

module.exports = {
  Duty: mongoose.model('Duty', dutySchema),
  Attendance: mongoose.model('Attendance', attendanceSchema),
};
