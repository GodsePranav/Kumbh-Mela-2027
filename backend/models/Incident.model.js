/**
 * Incident Model
 * Incidents reported by volunteers or users
 */

const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema(
  {
    incidentId: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: [
        'Medical',
        'Missing Person',
        'Lost Child',
        'Fire',
        'Accident',
        'Crowd Congestion',
        'Suspicious Activity',
        'Infrastructure',
        'Lost & Found',
        'Other',
      ],
      required: true,
    },
    priority: {
      type: String,
      enum: ['P0', 'P1', 'P2', 'P3'],
      default: 'P2',
    },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reporterName: { type: String, required: true },
    reporterRole: { type: String, enum: ['user', 'volunteer', 'supervisor', 'admin'], default: 'volunteer' },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    locationText: { type: String, required: true },
    description: { type: String, required: true },
    mediaUrls: [{ type: String }],
    assignedResponder: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['CREATED', 'ASSIGNED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'CREATED',
    },
    resolutionNotes: { type: String },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

incidentSchema.index({ location: '2dsphere' });
incidentSchema.index({ status: 1, priority: 1, createdAt: -1 });

module.exports = mongoose.model('Incident', incidentSchema);
