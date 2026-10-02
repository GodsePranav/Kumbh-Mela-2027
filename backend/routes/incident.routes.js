/**
 * Incident Routes
 */

const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incident.controller');

router.post('/create', incidentController.createIncident);
router.get('/', incidentController.getIncidents);
router.post('/:incidentId/status', incidentController.updateIncidentStatus);

module.exports = router;
