/**
 * Event Model
 * Kumbh Mela bathing dates, cultural events, exhibitions
 */

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    eventId:     { type: String, required: true, unique: true },
    title:       { type: String, required: true, trim: true },
    type:        {
      type: String,
      enum: ['bathing', 'cultural', 'exhibition', 'religious', 'announcement'],
      required: true,
    },
    date:        { type: String, required: true },
    time:        { type: String },
    location:    { type: String },
    description: { type: String },
    image:       { type: String },
    important:   { type: Boolean, default: false },
    expectedCrowd: { type: String },  // e.g. "15 lakh+"
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

eventSchema.index({ type: 1 });
eventSchema.index({ important: 1 });

module.exports = mongoose.model('Event', eventSchema);
