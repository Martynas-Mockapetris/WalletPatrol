// routes/auth.js - Auth maršrutai
import express from 'express';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/register - Registracija
router.post('/register', register);

// POST /api/auth/login - Login
router.post('/login', login);

export default router;
