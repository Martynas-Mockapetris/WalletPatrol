import express from 'express';
import { register, login } from '../controllers/authController.js';

// Create a router
const router = express.Router();

// POST /api/auth/register - Create new user
router.post('/register', register);

// POST /api/auth/login - Login existing user
router.post('/login', login);

// Export the router
export default router;