/**
 * User Routes  –  /api/v1/users
 */

const router  = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getProfile, updateProfile, changePassword,
  savePlace, unsavePlace, getSavedPlaces,
  addToSchedule, removeFromSchedule, deleteAccount,
} = require('../controllers/user.controller');

// All routes require authentication
router.use(protect);

router.get   ('/profile',                 getProfile);
router.put   ('/profile',                 updateProfile);
router.put   ('/password',                changePassword);
router.delete('/account',                 deleteAccount);

// Saved Places
router.get   ('/saved-places',            getSavedPlaces);
router.post  ('/saved-places/:placeId',   savePlace);
router.delete('/saved-places/:placeId',   unsavePlace);

// My Schedule (events)
router.post  ('/schedule/:eventId',       addToSchedule);
router.delete('/schedule/:eventId',       removeFromSchedule);

module.exports = router;
