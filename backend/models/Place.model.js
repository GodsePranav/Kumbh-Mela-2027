/**
 * Place Model
 * Temples, Ghats, and other tourist/religious locations
 */

const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema(
  {
    placeId:     { type: String, required: true, unique: true },  // e.g. "p1"
    name:        { type: String, required: true, trim: true },
    category:    {
      type: String,
      enum: ['religious', 'ghats', 'temples', 'food', 'shopping', 'medical', 'parking', 'police'],
      required: true,
    },
    subcategory: { type: String, trim: true },
    description: { type: String },
    images:      [{ type: String }],
    rating:      { type: Number, default: 0, min: 0, max: 5 },
    reviews:     { type: Number, default: 0 },
    distance:    { type: String },
    openHours:   { type: String },
    crowdLevel:  {
      type: String,
      enum: ['low', 'moderate', 'high', 'critical'],
      default: 'low',
    },
    crowdPercent: { type: Number, min: 0, max: 100 },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],   // [lng, lat]
        required: true,
      },
    },
    facilities: [{ type: String }],
    tags:       [{ type: String }],
    isActive:   { type: Boolean, default: true },
  },
  { timestamps: true }
);

placeSchema.index({ location: '2dsphere' });
placeSchema.index({ category: 1 });
placeSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Place', placeSchema);
