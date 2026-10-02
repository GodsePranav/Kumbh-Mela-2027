/**
 * Volunteer Routes
 */

const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteer.controller');

router.get('/', volunteerController.getVolunteers);
router.post('/status', volunteerController.updateDutyStatus);

module.exports = router;
