/**
 * Task Model
 * Volunteer operational tasks (Manual, Incident-generated, Crowd-generated, Supervisor-generated)
 */

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    taskId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    source: {
      type: String,
      enum: ['MANUAL', 'INCIDENT', 'CROWD', 'SUPERVISOR', 'ADMIN'],
      default: 'SUPERVISOR',
    },
    priority: {
      type: String,
      enum: ['P0', 'P1', 'P2', 'P3'],
      default: 'P2',
    },
    assignedVolunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    zoneId: { type: String },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: { type: [Number] }, // [lng, lat]
    },
    locationText: { type: String },
    status: {
      type: String,
      enum: ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'REJECTED', 'CANCELLED'],
      default: 'ASSIGNED',
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verificationNotes: { type: String },
  },
  { timestamps: true }
);

taskSchema.index({ assignedVolunteer: 1, status: 1 });

module.exports = mongoose.model('Task', taskSchema);
