/**
 * Trip Routes  –  /api/v1/trips
 */

const router  = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const { getMyTrips, getTripById, createTrip, updateTrip, deleteTrip } = require('../controllers/trip.controller');

router.use(protect);   // All trip routes require auth

router.get   ('/',    getMyTrips);
router.get   ('/:id', getTripById);
router.post  ('/',    createTrip);
router.put   ('/:id', updateTrip);
router.delete('/:id', deleteTrip);

module.exports = router;
