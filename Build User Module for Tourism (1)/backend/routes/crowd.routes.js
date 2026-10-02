/**
 * Crowd Routes
 */

const express = require('express');
const router = express.Router();
const crowdController = require('../controllers/crowd.controller');

router.get('/zones', crowdController.getZones);
router.post('/update', crowdController.updateDensity);
router.post('/deployments/approve', crowdController.approveDeployment);

module.exports = router;
