/**
 * Crowd Monitoring & Progressive Alert Engine Controller
 */

const CrowdZone = require('../models/CrowdZone.model');
const CrowdAlert = require('../models/CrowdAlert.model');
const VolunteerProfile = require('../models/VolunteerProfile.model');
const Task = require('../models/Task.model');

// Get all crowd zones with risk levels
exports.getZones = async (req, res) => {
  try {
    let zones = await CrowdZone.find();
    if (zones.length === 0) {
      // Seed default Kumbh zones if empty
      zones = await CrowdZone.insertMany([
        {
          zoneId: 'ZONE_RAM_GHAT',
          name: 'Ram Ghat',
          sector: 'Sector A',
          center: { lat: 19.9975, lng: 73.7898 },
          boundary: {
            type: 'Polygon',
            coordinates: [[[73.788, 19.996], [73.791, 19.996], [73.791, 19.999], [73.788, 19.999], [73.788, 19.996]]],
          },
          capacity: 15000,
          currentCount: 11250,
          currentDensityPercentage: 75,
          riskLevel: 'HIGH',
          assignedVolunteersCount: 8,
          recommendedVolunteersCount: 12,
        },
        {
          zoneId: 'ZONE_KALARAM',
          name: 'Kalaram Temple Circle',
          sector: 'Sector B',
          center: { lat: 20.0012, lng: 73.7954 },
          boundary: {
            type: 'Polygon',
            coordinates: [[[73.794, 20.000], [73.797, 20.000], [73.797, 20.003], [73.794, 20.003], [73.794, 20.000]]],
          },
          capacity: 8000,
          currentCount: 6800,
          currentDensityPercentage: 85,
          riskLevel: 'CRITICAL',
          assignedVolunteersCount: 5,
          recommendedVolunteersCount: 10,
        },
        {
          zoneId: 'ZONE_TAPOVAN',
          name: 'Tapovan Parking & Transit',
          sector: 'Sector C',
          center: { lat: 19.9920, lng: 73.8050 },
          boundary: {
            type: 'Polygon',
            coordinates: [[[73.803, 19.990], [73.807, 19.990], [73.807, 19.994], [73.803, 19.994], [73.803, 19.990]]],
          },
          capacity: 20000,
          currentCount: 8000,
          currentDensityPercentage: 40,
          riskLevel: 'NORMAL',
          assignedVolunteersCount: 12,
          recommendedVolunteersCount: 8,
        },
      ]);
    }
    return res.json({ success: true, data: zones });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Zone Density and evaluate progressive alert escalation
exports.updateDensity = async (req, res) => {
  try {
    const { zoneId, currentCount } = req.body;
    const zone = await CrowdZone.findOne({ zoneId });
    if (!zone) return res.status(404).json({ success: false, message: 'Zone not found' });

    zone.currentCount = currentCount;
    zone.currentDensityPercentage = Math.round((currentCount / zone.capacity) * 100);
    zone.lastDensityUpdate = new Date();

    const density = zone.currentDensityPercentage;
    let newRisk = 'NORMAL';
    if (density >= zone.thresholds.extreme) newRisk = 'EXTREME';
    else if (density >= zone.thresholds.critical) newRisk = 'CRITICAL';
    else if (density >= zone.thresholds.high) newRisk = 'HIGH';
    else if (density >= zone.thresholds.caution) newRisk = 'CAUTION';

    const previousRisk = zone.riskLevel;
    zone.riskLevel = newRisk;
    await zone.save();

    // Trigger progressive alert if risk escalated
    if (newRisk !== 'NORMAL' && newRisk !== previousRisk) {
      const alertId = `ALERT_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const message = `Density reached ${density}% (${newRisk}) in ${zone.name}`;

      // Calculate recommended volunteers
      const nearbyVolunteers = await VolunteerProfile.find({ dutyStatus: 'ON_DUTY' }).populate('user', 'name');
      const recommended = nearbyVolunteers.slice(0, 5).map(v => ({
        volunteer: v.user._id,
        volunteerName: v.user.name,
        distance: 120,
        status: 'RECOMMENDED',
      }));

      const alert = await CrowdAlert.create({
        alertId,
        zone: zone._id,
        zoneId: zone.zoneId,
        zoneName: zone.name,
        riskLevel: newRisk,
        densityPercentage: density,
        message,
        recommendedDeployments: recommended,
      });

      const io = req.app.get('io');
      if (io) {
        io.emit('crowd-alert-created', {
          alertId,
          zoneId: zone.zoneId,
          zoneName: zone.name,
          riskLevel: newRisk,
          densityPercentage: density,
          message,
        });
      }
    }

    return res.json({ success: true, data: zone });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Supervisor approves recommended deployment to create volunteer tasks
exports.approveDeployment = async (req, res) => {
  try {
    const { alertId, selectedVolunteerIds } = req.body;
    const alert = await CrowdAlert.findOne({ alertId }).populate('zone');
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });

    alert.status = 'APPROVED';
    alert.approvedAt = new Date();
    await alert.save();

    // Create Tasks for selected volunteers
    const createdTasks = [];
    for (const volId of selectedVolunteerIds) {
      const task = await Task.create({
        taskId: `TASK_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        title: `Crowd Control Duty - ${alert.zoneName}`,
        description: `Deploy to ${alert.zoneName} for crowd surge management (Density: ${alert.densityPercentage}%).`,
        source: 'CROWD',
        priority: 'P1',
        assignedVolunteer: volId,
        zoneId: alert.zoneId,
        location: alert.zone ? alert.zone.boundary : { type: 'Point', coordinates: [73.7898, 19.9975] },
        locationText: alert.zoneName,
        status: 'ASSIGNED',
      });
      createdTasks.push(task);
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('deployment-approved', {
        alertId,
        tasksCreated: createdTasks.length,
      });
    }

    return res.json({ success: true, message: 'Deployment approved and tasks assigned.', data: createdTasks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
