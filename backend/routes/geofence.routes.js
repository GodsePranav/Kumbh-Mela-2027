/**
 * Geofence Routes
 */

const express = require('express');
const router = express.Router();
const geofenceController = require('../controllers/geofence.controller');

router.post('/update-location', geofenceController.updateLocationAndValidate);
router.get('/violations', geofenceController.getViolations);

module.exports = router;
