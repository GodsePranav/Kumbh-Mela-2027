/**
 * AuditLog Model
 * Auditable state change log for critical operational events.
 */

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    logId: { type: String, required: true, unique: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actorRole: { type: String },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    previousState: { type: mongoose.Schema.Types.Mixed },
    newState: { type: mongoose.Schema.Types.Mixed },
    notes: { type: String },
    ipAddress: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

auditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
