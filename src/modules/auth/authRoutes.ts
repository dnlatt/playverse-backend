// src/modules/auth/authRoutes.ts
import { Router } from 'express';
import { register, login } from './authController';

const router = Router();

// Define the routes for user registration and login
router.post('/login', login);
router.post('/register', register);

export default router;
