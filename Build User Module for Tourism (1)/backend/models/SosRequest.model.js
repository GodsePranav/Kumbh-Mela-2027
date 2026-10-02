const mongoose = require('mongoose');

const sosStateEnum = ['CREATED', 'BROADCASTING', 'ACKNOWLEDGED', 'ACCEPTED', 'RESPONDER_ASSIGNED', 'EN_ROUTE', 'NEARBY', 'ARRIVED', 'ASSISTING', 'RESOLVED', 'COMPLETED', 'REJECTED', 'CANCELLED', 'EXPIRED', 'FAILED', 'ESCALATED'];
const sosRequestSchema = new mongoose.Schema({
  sosId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  activeUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  userPhone: { type: String },
  category: { type: String, enum: ['sos', 'medical', 'fire', 'missing_person', 'crowd_crush', 'accident', 'crime', 'other'], default: 'sos' },
  priority: { type: String, enum: ['P0', 'P1', 'P2'], default: 'P0' },
  location: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: { type: [Number], required: true } },
  locationAccuracy: { type: Number },
  locationCapturedAt: { type: Date },
  locationText: { type: String },
  status: { type: String, enum: sosStateEnum, default: 'CREATED' },
  waveIndex: { type: Number, default: 1 },
  notifiedVolunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  rejectedBy: [{ volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, timestamp: { type: Date, default: Date.now }, reason: { type: String } }],
  assignedResponder: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  responderName: { type: String },
  responderPhone: { type: String },
  responderBadge: { type: String },
  acceptedAt: { type: Date },
  responderLocation: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: { type: [Number] } },
  responderLocationAccuracy: { type: Number },
  responderLocationUpdatedAt: { type: Date },
  etaSeconds: { type: Number },
  distanceMeters: { type: Number },
  routeCoordinates: [[Number]],
  statusHistory: [{ status: { type: String, enum: sosStateEnum, required: true }, actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, actorRole: String, notes: String, location: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: [Number] }, timestamp: { type: Date, default: Date.now } }],
  resolvedAt: { type: Date },
  completedAt: { type: Date },
  cancelledAt: { type: Date },
  resolutionNotes: { type: String },
}, { timestamps: true });

sosRequestSchema.index({ location: '2dsphere' });
sosRequestSchema.index({ status: 1, priority: 1, createdAt: -1 });
sosRequestSchema.index({ user: 1 });
sosRequestSchema.index({ assignedResponder: 1 });
sosRequestSchema.index({ activeUser: 1 }, { unique: true, partialFilterExpression: { activeUser: { $exists: true } } });

module.exports = mongoose.model('SosRequest', sosRequestSchema);
module.exports.SOS_STATES = sosStateEnum;
