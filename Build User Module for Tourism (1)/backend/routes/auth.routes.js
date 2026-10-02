/**
 * Auth Routes  –  /api/v1/auth
 */

const router = require('express').Router();
const { body } = require('express-validator');
const { register, login, getMe, logout, quickLogin } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Validation rules
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', registerRules, register);
router.post('/login',    loginRules,    login);
router.post('/quick-login', quickLogin);
router.get ('/me',       protect,       getMe);
router.post('/logout',   protect,       logout);

module.exports = router;
