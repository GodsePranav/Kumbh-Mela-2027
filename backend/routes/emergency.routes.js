/**
 * Emergency Routes  –  /api/v1/emergency
 */

const router  = require('express').Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  createSOS, getMyAlerts, getEmergencyContacts, resolveAlert,
} = require('../controllers/emergency.controller');

router.get ('/contacts',         getEmergencyContacts);   // Public

router.use(protect);
router.post ('/sos',             createSOS);
router.get  ('/my-alerts',       getMyAlerts);
router.patch('/:id/resolve',     authorize('admin', 'volunteer'), resolveAlert);

module.exports = router;
