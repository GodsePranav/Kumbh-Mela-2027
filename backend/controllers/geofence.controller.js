/**
 * Geofencing & Zone Validation Controller
 */

const GeofenceViolation = require('../models/GeofenceViolation.model');
const VolunteerProfile = require('../models/VolunteerProfile.model');
const { calculateHaversineDistance } = require('../utils/routing');

// Check volunteer GPS coordinates against assigned zone with buffer & consecutive reading check
exports.updateLocationAndValidate = async (req, res) => {
  try {
    const { volunteerId, lat, lng, zoneCenterLat, zoneCenterLng, zoneRadiusMeters } = req.body;

    const volunteer = await VolunteerProfile.findOne({
      $or: [{ user: volunteerId }, { _id: volunteerId }],
    }).populate('user', 'name mobile');

    if (!volunteer) return res.status(404).json({ success: false, message: 'Volunteer profile not found' });

    // Update volunteer live location
    volunteer.location = { type: 'Point', coordinates: [lng, lat] };
    volunteer.lastLocationUpdate = new Date();
    await volunteer.save();

    // Geofence boundary check (circle around assigned zone center)
    const centerLat = zoneCenterLat || 19.9975;
    const centerLng = zoneCenterLng || 73.7898;
    const radiusMeters = zoneRadiusMeters || 500; // 500 meters allowed radius

    const distanceFromCenter = calculateHaversineDistance(lat, lng, centerLat, centerLng);
    const isOutside = distanceFromCenter > radiusMeters;
    const distanceOutsideMeters = isOutside ? Math.round(distanceFromCenter - radiusMeters) : 0;

    let violation = null;

    if (isOutside) {
      // Find active pending violation or create new one
      const existing = await GeofenceViolation.findOne({
        volunteer: volunteer.user._id,
        status: { $in: ['PENDING_VERIFICATION', 'VERIFIED_VIOLATION'] },
      });

      if (existing) {
        existing.consecutiveReadings += 1;
        existing.distanceOutsideMeters = distanceOutsideMeters;
        existing.location = { type: 'Point', coordinates: [lng, lat] };

        // Buffer + Grace period + 2 consecutive readings => Verify Violation
        if (existing.consecutiveReadings >= 2 && existing.status === 'PENDING_VERIFICATION') {
          existing.status = 'VERIFIED_VIOLATION';
          existing.supervisorAlerted = true;

          const io = req.app.get('io');
          if (io) {
            io.emit('geofence-violation', {
              violationId: existing.violationId,
              volunteerName: volunteer.user.name,
              assignedZone: volunteer.assignedZone,
              distanceOutsideMeters,
            });
          }
        }
        await existing.save();
        violation = existing;
      } else {
        const violationId = `GEOFENCE_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        violation = await GeofenceViolation.create({
          violationId,
          volunteer: volunteer.user._id,
          volunteerName: volunteer.user.name,
          assignedZoneId: volunteer.assignedZone || 'ZONE_A',
          assignedZoneName: volunteer.assignedZone || 'Ram Ghat',
          violationType: 'ZONE_EXIT',
          location: { type: 'Point', coordinates: [lng, lat] },
          distanceOutsideMeters,
          consecutiveReadings: 1,
          status: 'PENDING_VERIFICATION',
        });
      }
    } else {
      // If returned inside zone, resolve active violation
      const activeViolation = await GeofenceViolation.findOne({
        volunteer: volunteer.user._id,
        status: { $in: ['PENDING_VERIFICATION', 'VERIFIED_VIOLATION'] },
      });

      if (activeViolation) {
        activeViolation.status = 'RESOLVED_RETURNED';
        activeViolation.notes = 'Returned to assigned zone.';
        await activeViolation.save();

        const io = req.app.get('io');
        if (io) {
          io.emit('geofence-returned', {
            volunteerName: volunteer.user.name,
            assignedZone: volunteer.assignedZone,
          });
        }
      }
    }

    return res.json({
      success: true,
      data: {
        isOutside,
        distanceFromCenter,
        distanceOutsideMeters,
        violation,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Geofence Violation Feed for Control Room
exports.getViolations = async (req, res) => {
  try {
    const violations = await GeofenceViolation.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: violations });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
