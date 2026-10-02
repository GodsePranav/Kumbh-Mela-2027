/**
 * AI Assistant Routes  –  /api/v1/ai
 */

const router  = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const { chat, getSuggestions } = require('../controllers/ai.controller');

router.get ('/suggestions', getSuggestions);    // Public
router.post('/chat',        protect, chat);      // Auth required

module.exports = router;
