import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

// Create a router
const router = express.Router();

// POST /api/auth/register - Create new user
router.post('/register', register);

// POST /api/auth/login - Login existing user
router.post('/login', login);

router.get('/me', protect, getMe);

// Export the router
export default router;
