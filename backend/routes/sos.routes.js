/**
 * SOS Routes
 */

const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sos.controller');

router.post('/create', sosController.createSos);
router.post('/:sosId/accept', sosController.acceptSos);
router.post('/:sosId/reject', sosController.rejectSos);
router.post('/:sosId/location', sosController.updateResponderLocation);
router.post('/:sosId/status', sosController.updateSosStatus);
router.get('/active', sosController.getActiveSos);
router.get('/:sosId', sosController.getSosById);

module.exports = router;
