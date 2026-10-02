/**
 * Map Routes  –  /api/v1/map
 */

const router  = require('express').Router();
const { getMapMarkers, getCrowdData, getTransportOptions, getParkingZones } = require('../controllers/map.controller');

// All public
router.get('/markers',   getMapMarkers);
router.get('/crowd',     getCrowdData);
router.get('/transport', getTransportOptions);
router.get('/parking',   getParkingZones);

module.exports = router;
