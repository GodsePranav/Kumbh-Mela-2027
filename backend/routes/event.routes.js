/**
 * Event Routes  –  /api/v1/events
 */

const router  = require('express').Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getAllEvents, getEventById, createEvent, updateEvent, deleteEvent,
} = require('../controllers/event.controller');

// Public
router.get('/',    getAllEvents);
router.get('/:id', getEventById);

// Admin-only
router.post  ('/',    protect, authorize('admin'), createEvent);
router.put   ('/:id', protect, authorize('admin'), updateEvent);
router.delete('/:id', protect, authorize('admin'), deleteEvent);

module.exports = router;
