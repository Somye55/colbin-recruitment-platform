import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { authenticate, sanitizeInput, rateLimit } from '../middleware/auth';
import { registerValidation, loginValidation } from '../controllers/authController';

const router = Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register',
  rateLimit(3, 15 * 60 * 1000), // 3 requests per 15 minutes
  sanitizeInput,
  registerValidation,
  register
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login',
  rateLimit(5, 15 * 60 * 1000), // 5 requests per 15 minutes
  sanitizeInput,
  loginValidation,
  login
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticate, getMe);

export default router;