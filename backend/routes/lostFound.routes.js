/**
 * Lost & Found Routes  –  /api/v1/lost-found
 */

const router  = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getAll, createReport, getMyReports, resolveReport, deleteReport,
} = require('../controllers/lostFound.controller');

router.get('/',  getAll);   // Public – browse all open reports

router.use(protect);
router.post  ('/',               createReport);
router.get   ('/my-reports',     getMyReports);
router.patch ('/:id/resolve',    resolveReport);
router.delete('/:id',            deleteReport);

module.exports = router;
