/**
 * Task Routes
 */

const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');

router.post('/create', taskController.createTask);
router.get('/', taskController.getTasks);
router.post('/:taskId/status', taskController.updateTaskStatus);

module.exports = router;
