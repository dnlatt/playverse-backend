// src/modules/users/userRoutes.ts
import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from './userController';
import { protect, authorize } from '../../middlewares/authMiddleware';
import { config } from '../../config';

const ADMIN_ID = parseInt(config.ADMIN_ID, 10) || 1;

const router = Router();

// --- Admin-only Routes ---
// These routes require a valid token and the admin role.
router.get('/', protect, authorize(ADMIN_ID), getUsers);
router.get('/:userId', protect, authorize(ADMIN_ID), getUserById);
router.post('/', protect, authorize(ADMIN_ID), createUser);
router.patch('/:userId', protect, authorize(ADMIN_ID), updateUser);
router.delete('/:userId', protect, authorize(ADMIN_ID), deleteUser);

export default router;
