/**
 * Duty & Attendance Controller
 */

const { Duty, Attendance } = require('../models/Duty.model');

exports.getDutyRoster = async (req, res) => {
  try {
    const { volunteerId } = req.query;
    const query = volunteerId ? { volunteer: volunteerId } : {};
    let duties = await Duty.find(query).sort({ startTime: 1 });

    if (duties.length === 0) {
      duties = [
        {
          _id: 'duty_001',
          dutyId: 'DUTY_RAM_GHAT_MORNING',
          zoneId: 'ZONE_RAM_GHAT',
          zoneName: 'Ram Ghat Sector B',
          shiftName: 'Morning Shift (06:00 - 14:00)',
          startTime: new Date(Date.now() - 3600 * 1000 * 2),
          endTime: new Date(Date.now() + 3600 * 1000 * 6),
          reportingLocation: 'Ram Ghat Control Post 1',
          instructions: 'Maintain orderly queue movement near main bathing ghats. Assist elderly pilgrims.',
          status: 'ACTIVE',
        },
      ];
    }
    return res.json({ success: true, data: duties });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.checkIn = async (req, res) => {
  try {
    const { volunteerId, dutyId, lat, lng } = req.body;
    const attendanceId = `ATT_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const attendance = await Attendance.create({
      attendanceId,
      volunteer: volunteerId || '60d5ecb8b5c9c40015f8e001',
      checkInTime: new Date(),
      checkInLocation: { type: 'Point', coordinates: [lng || 73.7898, lat || 19.9975] },
      verificationType: 'GPS',
      status: 'PRESENT',
    });

    return res.status(201).json({ success: true, data: attendance, message: 'Checked in successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const { attendanceId, lat, lng } = req.body;
    const attendance = await Attendance.findOne({ $or: [{ attendanceId }, { _id: attendanceId }] });
    if (!attendance) return res.status(404).json({ success: false, message: 'Attendance record not found' });

    attendance.checkOutTime = new Date();
    attendance.checkOutLocation = { type: 'Point', coordinates: [lng || 73.7898, lat || 19.9975] };
    await attendance.save();

    return res.json({ success: true, data: attendance, message: 'Checked out successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
