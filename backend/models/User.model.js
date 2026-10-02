/**
 * User Model
 * Handles pilgrim/tourist registration, authentication and profile
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // never returned in queries by default
    },
    mobile: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'],
    },
    language: {
      type: String,
      enum: ['hi', 'mr', 'en', 'gu', 'bn', 'ta'],
      default: 'hi',
    },
    hometown: { type: String, trim: true },
    emergencyContact: { type: String, trim: true },
    avatar: { type: String, default: '' },

    // Pilgrim-specific fields
    pilgrimId: { type: String, unique: true, sparse: true },  // govt-issued ID
    aadhaarLast4: { type: String, maxlength: 4 },

    // Saved places & events
    savedPlaces: [{ type: String }],           // place IDs
    mySchedule:  [{ type: String }],           // event IDs

    // Notifications preferences
    notificationsEnabled: { type: Boolean, default: true },

    role: {
      type: String,
      enum: ['user', 'volunteer', 'supervisor', 'zone_manager', 'admin'],
      default: 'user',
    },
    isVerified: { type: Boolean, default: false },
    isActive:   { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── Hash password before saving ─────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance method: compare password ───────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Exclude password from JSON output ───────────────────────────────────────
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
