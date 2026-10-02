/**
 * LostFound Model
 * Lost & Found item reports by pilgrims
 */

const mongoose = require('mongoose');

const lostFoundSchema = new mongoose.Schema(
  {
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type:       {
      type: String,
      enum: ['lost', 'found'],
      required: true,
    },
    category: {
      type: String,
      enum: ['person', 'bag', 'wallet', 'phone', 'document', 'jewellery', 'other'],
      required: true,
    },
    title:       { type: String, required: true, trim: true },
    description: { type: String },
    location:    { type: String },          // last seen / found location description
    contact:     { type: String },          // contact number for this report
    images:      [{ type: String }],
    status: {
      type: String,
      enum: ['open', 'resolved', 'closed'],
      default: 'open',
    },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

lostFoundSchema.index({ type: 1, status: 1 });
lostFoundSchema.index({ reportedBy: 1 });

module.exports = mongoose.model('LostFound', lostFoundSchema);
