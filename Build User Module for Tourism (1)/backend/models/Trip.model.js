/**
 * Trip Model
 * User-created trip plans / itineraries
 */

const mongoose = require('mongoose');

const tripItemSchema = new mongoose.Schema({
  time:     { type: String },
  activity: { type: String, required: true },
  location: { type: String },
  placeId:  { type: String },          // optional ref to Place
  notes:    { type: String },
}, { _id: false });

const tripSchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title:    { type: String, required: true, trim: true },
    date:     { type: String },           // e.g. "August 9, 2027"
    duration: { type: String },           // e.g. "1 Day"
    type:     {
      type: String,
      enum: ['solo', 'family', 'group', 'custom'],
      default: 'solo',
    },
    items:    [tripItemSchema],
    notes:    { type: String },
    isShared: { type: Boolean, default: false },
    status:   {
      type: String,
      enum: ['planned', 'active', 'completed', 'cancelled'],
      default: 'planned',
    },
  },
  { timestamps: true }
);

tripSchema.index({ user: 1 });

module.exports = mongoose.model('Trip', tripSchema);
