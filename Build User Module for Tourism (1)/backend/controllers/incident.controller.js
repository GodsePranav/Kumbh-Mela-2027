/**
 * Incident Management Controller
 */

const Incident = require('../models/Incident.model');

let incCounter = 10001;
function generateIncidentId() {
  incCounter += 1;
  return `INC-2027-${String(incCounter).padStart(6, '0')}`;
}

// Report new incident
exports.createIncident = async (req, res) => {
  try {
    const { category, priority, description, locationText, coordinates, mediaUrls } = req.body;
    const reporterId = req.user ? req.user._id : '60d5ecb8b5c9c40015f8e001';
    const reporterName = req.user ? req.user.name : (req.body.reporterName || 'Field Responder');
    const reporterRole = req.user ? req.user.role : 'volunteer';

    const incidentId = generateIncidentId();
    const incident = await Incident.create({
      incidentId,
      category: category || 'Medical',
      priority: priority || 'P2',
      reporter: reporterId,
      reporterName,
      reporterRole,
      location: { type: 'Point', coordinates: coordinates || [73.7898, 19.9975] },
      locationText: locationText || 'Ram Ghat Sector B',
      description: description || 'Field incident reported.',
      mediaUrls: mediaUrls || [],
      status: 'CREATED',
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('incident-created', incident);
    }

    return res.status(201).json({ success: true, data: incident });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all incidents
exports.getIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: incidents });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update incident status (ASSIGNED, ACKNOWLEDGED, IN_PROGRESS, RESOLVED, CLOSED)
exports.updateIncidentStatus = async (req, res) => {
  try {
    const { incidentId } = req.params;
    const { status, resolutionNotes } = req.body;

    const incident = await Incident.findOne({ $or: [{ incidentId }, { _id: incidentId }] });
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });

    incident.status = status;
    if (status === 'RESOLVED' || status === 'CLOSED') {
      incident.resolvedAt = new Date();
      incident.resolutionNotes = resolutionNotes || 'Incident resolved.';
    }

    await incident.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('incident-updated', incident);
    }

    return res.json({ success: true, data: incident });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
