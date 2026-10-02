/**
 * Notification Routes  –  /api/v1/notifications
 */

const router  = require('express').Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getNotifications, markAsRead, markAllAsRead, createNotification,
} = require('../controllers/notification.controller');

router.use(protect);

router.get  ('/',              getNotifications);
router.patch('/read-all',      markAllAsRead);
router.patch('/:id/read',      markAsRead);

// Admin broadcast notifications
router.post ('/',  authorize('admin'), createNotification);

module.exports = router;
