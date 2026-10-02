/**
 * SosRequest Model
 * Production SOS State Machine:
 * CREATED -> BROADCASTING -> ACKNOWLEDGED -> ACCEPTED -> RESPONDER_ASSIGNED
 * -> EN_ROUTE -> NEARBY -> ARRIVED -> ASSISTING -> RESOLVED
 * (or REJECTED, CANCELLED, EXPIRED, ESCALATED)
 */

const mongoose = require('mongoose');

const sosStateEnum = [
  'CREATED',
  'BROADCASTING',
  'ACKNOWLEDGED',
  'ACCEPTED',
  'RESPONDER_ASSIGNED',
  'EN_ROUTE',
  'NEARBY',
  'ARRIVED',
  'ASSISTING',
  'RESOLVED',
  'REJECTED',
  'CANCELLED',
  'EXPIRED',
  'ESCALATED',
];

const sosRequestSchema = new mongoose.Schema(
  {
    sosId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userPhone: { type: String },
    category: {
      type: String,
      enum: ['sos', 'medical', 'fire', 'missing_person', 'crowd_crush', 'accident', 'crime', 'other'],
      default: 'sos',
    },
    priority: {
      type: String,
      enum: ['P0', 'P1', 'P2'],
      default: 'P0',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    locationText: { type: String, default: 'Kumbh Mela Sector' },
    status: {
      type: String,
      enum: sosStateEnum,
      default: 'CREATED',
    },
    waveIndex: { type: Number, default: 1 },
    notifiedVolunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    rejectedBy: [
      {
        volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
        reason: { type: String },
      },
    ],
    assignedResponder: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    responderName: { type: String },
    responderPhone: { type: String },
    responderBadge: { type: String },
    responderLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: { type: [Number] },
    },
    etaSeconds: { type: Number },
    distanceMeters: { type: Number },
    routeCoordinates: [[Number]],
    statusHistory: [
      {
        status: { type: String, enum: sosStateEnum, required: true },
        actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        actorRole: { type: String },
        notes: { type: String },
        location: {
          type: { type: String, enum: ['Point'], default: 'Point' },
          coordinates: [Number],
        },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    resolvedAt: { type: Date },
    resolutionNotes: { type: String },
  },
  { timestamps: true }
);

sosRequestSchema.index({ location: '2dsphere' });
sosRequestSchema.index({ status: 1, priority: 1, createdAt: -1 });
sosRequestSchema.index({ user: 1 });
sosRequestSchema.index({ assignedResponder: 1 });

module.exports = mongoose.model('SosRequest', sosRequestSchema);
module.exports.SOS_STATES = sosStateEnum;
