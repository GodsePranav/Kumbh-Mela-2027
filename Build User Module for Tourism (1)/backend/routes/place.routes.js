/**
 * Place Routes  –  /api/v1/places
 */

const router  = require('express').Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getAllPlaces, getNearbyPlaces, getPlaceById,
  createPlace, updatePlace, deletePlace,
} = require('../controllers/place.controller');

// Public
router.get('/',         getAllPlaces);
router.get('/nearby',   getNearbyPlaces);
router.get('/:id',      getPlaceById);

// Admin-only mutations
router.post  ('/',     protect, authorize('admin'), createPlace);
router.put   ('/:id',  protect, authorize('admin'), updatePlace);
router.delete('/:id',  protect, authorize('admin'), deletePlace);

module.exports = router;
