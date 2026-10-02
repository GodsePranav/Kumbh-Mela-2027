const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sos.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);
router.post('/create', authorize('user', 'volunteer'), sosController.createSos);
router.post('/volunteer-location', authorize('volunteer'), sosController.updateVolunteerLocation);
router.get('/volunteer-duty', authorize('volunteer'), sosController.getVolunteerDuty);
router.post('/volunteer-duty', authorize('volunteer'), sosController.updateVolunteerDuty);
router.get('/active', authorize('volunteer', 'supervisor', 'zone_manager', 'admin'), sosController.getActiveSos);
router.post('/:sosId/accept', authorize('volunteer'), sosController.acceptSos);
router.post('/:sosId/reject', authorize('volunteer'), sosController.rejectSos);
router.post('/:sosId/location', authorize('volunteer'), sosController.updateResponderLocation);
router.post('/:sosId/status', authorize('volunteer'), sosController.updateSosStatus);
router.post('/:sosId/cancel', authorize('user', 'volunteer'), sosController.cancelSos);
router.post('/:sosId/user-location', authorize('user'), sosController.updateUserLocation);
router.get('/:sosId', sosController.getSosById);

module.exports = router;
