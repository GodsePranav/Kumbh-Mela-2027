/**
 * CrowdAlert Model
 * Progressive Alert Engine logs and Deployment Approvals
 */

const mongoose = require('mongoose');

const crowdAlertSchema = new mongoose.Schema(
  {
    alertId: { type: String, required: true, unique: true },
    zone: { type: mongoose.Schema.Types.ObjectId, ref: 'CrowdZone', required: true },
    zoneId: { type: String, required: true },
    zoneName: { type: String, required: true },
    riskLevel: {
      type: String,
      enum: ['NORMAL', 'CAUTION', 'HIGH', 'CRITICAL', 'EXTREME'],
      required: true,
    },
    densityPercentage: { type: Number, required: true },
    message: { type: String, required: true },
    recommendedDeployments: [
      {
        volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        volunteerName: { type: String },
        distance: { type: Number },
        status: {
          type: String,
          enum: ['RECOMMENDED', 'APPROVED', 'DEPLOYED', 'REJECTED'],
          default: 'RECOMMENDED',
        },
      },
    ],
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    status: {
      type: String,
      enum: ['ACTIVE', 'APPROVED', 'ESCALATED', 'RESOLVED'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

crowdAlertSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('CrowdAlert', crowdAlertSchema);
