/**
 * Duty & Attendance Routes
 */

const express = require('express');
const router = express.Router();
const dutyController = require('../controllers/duty.controller');

router.get('/roster', dutyController.getDutyRoster);
router.post('/check-in', dutyController.checkIn);
router.post('/check-out', dutyController.checkOut);

module.exports = router;
