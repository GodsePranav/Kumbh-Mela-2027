/**
 * Volunteer Controller
 */

const VolunteerProfile = require('../models/VolunteerProfile.model');
const User = require('../models/User.model');

// Get all active volunteers (for Control Room live map)
exports.getVolunteers = async (req, res) => {
  try {
    let volunteers = await VolunteerProfile.find().populate('user', 'name mobile role email');
    if (volunteers.length === 0) {
      // Return sample active volunteers for control room visualization if DB empty
      volunteers = [
        {
          _id: 'vol_001',
          badgeNumber: 'VOL-101',
          user: { name: 'Rahul Sharma', mobile: '9876543210', role: 'volunteer' },
          dutyStatus: 'ON_DUTY',
          assignedZone: 'Ram Ghat Sector B',
          location: { type: 'Point', coordinates: [73.7898, 19.9975] },
          skills: ['first_aid', 'crowd_control'],
          batteryLevel: 88,
          rating: 4.9,
        },
        {
          _id: 'vol_002',
          badgeNumber: 'VOL-102',
          user: { name: 'Priya Verma', mobile: '9876543211', role: 'volunteer' },
          dutyStatus: 'RESPONDING',
          assignedZone: 'Kalaram Temple Circle',
          location: { type: 'Point', coordinates: [73.7954, 20.0012] },
          skills: ['medical', 'translator'],
          batteryLevel: 74,
          rating: 5.0,
        },
        {
          _id: 'vol_003',
          badgeNumber: 'VOL-103',
          user: { name: 'Amit Patel', mobile: '9876543212', role: 'supervisor' },
          dutyStatus: 'ON_DUTY',
          assignedZone: 'Tapovan Sector C',
          location: { type: 'Point', coordinates: [73.8050, 19.9920] },
          skills: ['crowd_control', 'logistics', 'search_rescue'],
          batteryLevel: 92,
          rating: 4.95,
        },
      ];
    }
    return res.json({ success: true, data: volunteers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle volunteer duty status (OFF_DUTY, ON_DUTY, RESPONDING, BREAK)
exports.updateDutyStatus = async (req, res) => {
  try {
    const { volunteerId, dutyStatus } = req.body;
    let profile = await VolunteerProfile.findOne({
      $or: [{ user: volunteerId }, { _id: volunteerId }],
    });

    if (!profile) {
      profile = await VolunteerProfile.create({
        user: volunteerId || '60d5ecb8b5c9c40015f8e001',
        badgeNumber: `VOL-${Math.floor(100 + Math.random() * 900)}`,
        dutyStatus: dutyStatus || 'ON_DUTY',
      });
    } else {
      profile.dutyStatus = dutyStatus;
      await profile.save();
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('volunteer-status-changed', { volunteerId: profile.user, dutyStatus });
    }

    return res.json({ success: true, data: profile, message: `Status updated to ${dutyStatus}` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
