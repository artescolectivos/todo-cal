import express from 'express';
import cookieParser from 'cookie-parser';
import {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword,
  authenticateToken
} from '../../src/auth-system.js';

const router = express.Router();

// Middleware for parsing cookies
router.use(cookieParser());

// Public routes (no authentication required)
router.post('/register', register);
router.post('/login', login);

// Protected routes (authentication required)
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getCurrentUser);
router.put('/profile', authenticateToken, updateProfile);
router.put('/password', authenticateToken, changePassword);

export default router;