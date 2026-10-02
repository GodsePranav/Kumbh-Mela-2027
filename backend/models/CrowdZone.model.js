/**
 * CrowdZone Model
 * Crowd Monitoring & Density Engine Entity
 */

const mongoose = require('mongoose');

const crowdZoneSchema = new mongoose.Schema(
  {
    zoneId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    sector: { type: String, required: true },
    boundary: {
      type: {
        type: String,
        enum: ['Polygon'],
        default: 'Polygon',
      },
      coordinates: { type: [[[Number]]], required: true }, // [[[lng, lat], ...]]
    },
    center: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    capacity: { type: Number, required: true, default: 10000 },
    currentCount: { type: Number, default: 2500 },
    currentDensityPercentage: { type: Number, default: 25 },
    riskLevel: {
      type: String,
      enum: ['NORMAL', 'CAUTION', 'HIGH', 'CRITICAL', 'EXTREME'],
      default: 'NORMAL',
    },
    thresholds: {
      caution: { type: Number, default: 60 },  // %
      high: { type: Number, default: 75 },     // %
      critical: { type: Number, default: 85 }, // %
      extreme: { type: Number, default: 95 },  // %
    },
    assignedVolunteersCount: { type: Number, default: 5 },
    recommendedVolunteersCount: { type: Number, default: 5 },
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastDensityUpdate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

crowdZoneSchema.index({ boundary: '2dsphere' });
crowdZoneSchema.index({ riskLevel: 1 });

module.exports = mongoose.model('CrowdZone', crowdZoneSchema);
